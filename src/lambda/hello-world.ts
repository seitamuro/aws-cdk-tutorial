import {
  aws_apigateway,
  aws_iam,
  aws_lambda_nodejs,
  aws_s3,
  Duration,
} from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class HelloWorld extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    /*const helloFunction = new NodejsFunction(this, "function");
    new LambdaRestApi(this, "apigw", {
      handler: helloFunction,
    });*/

    const nameHelloWorldFunc = "Hello_world_func";
    const registerTaskFunc = new aws_lambda_nodejs.NodejsFunction(
      this,
      nameHelloWorldFunc,
      {
        runtime: Runtime.NODEJS_20_X,
        entry: "src/lambda/hello-world.function.ts",
        handler: "handler",
        timeout: Duration.seconds(10),
        logRetention: 30,
      }
    );

    const nameRestApi = "Rest API with Lambda";
    const restApi = new aws_apigateway.RestApi(this, nameRestApi, {
      restApiName: nameRestApi.replace(/ /g, "_"),
      deployOptions: {
        stageName: "v1",
      },
    });

    const restApiHelloWorld = restApi.root.addResource("hello_world");

    restApiHelloWorld.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(registerTaskFunc)
    );

    const nameBucket = "MyFirstBucket";
    const iamRoleForLambdaWriter = new aws_iam.Role(this, "LambdaWriterRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    const iamRoleForLambdaReader = new aws_iam.Role(this, "LambdaReaderRole", {
      assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    const bucket = new aws_s3.Bucket(this, nameBucket);
    bucket.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [bucket.bucketArn + "/*"],
        principals: [iamRoleForLambdaWriter],
      })
    );
    bucket.addToResourcePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        resources: [bucket.bucketArn + "/*"],
        principals: [iamRoleForLambdaReader],
      })
    );

    const registerTaskFuncUploadToS3 = new aws_lambda_nodejs.NodejsFunction(
      this,
      "UploadToS3",
      {
        runtime: Runtime.NODEJS_20_X,
        entry: "src/lambda/upload-to-s3.ts",
        handler: "handler",
        environment: {
          S3_BUCKET_NAME: bucket.bucketName,
        },
        role: iamRoleForLambdaWriter,
      }
    );
    const restApiUploadToS3 = restApi.root.addResource("upload_to_s3");
    restApiUploadToS3.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(registerTaskFuncUploadToS3)
    );

    const registerTaskFuncReadFromS3 = new aws_lambda_nodejs.NodejsFunction(
      this,
      "ReadFromS3",
      {
        runtime: Runtime.NODEJS_20_X,
        entry: "src/lambda/read-from-s3.ts",
        handler: "handler",
        environment: {
          S3_BUCKET_NAME: bucket.bucketName,
        },
        role: iamRoleForLambdaReader,
      }
    );
    const restApiReadFromS3 = restApi.root.addResource("read_from_s3");
    restApiReadFromS3.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(registerTaskFuncReadFromS3)
    );
  }
}
