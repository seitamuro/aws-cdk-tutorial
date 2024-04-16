import { aws_apigateway, aws_lambda_nodejs, Duration } from "aws-cdk-lib";
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
  }
}
