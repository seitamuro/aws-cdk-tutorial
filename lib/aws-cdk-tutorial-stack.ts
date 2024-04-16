import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HelloWorld } from "../src/lambda/hello-world";

export class AwsCdkTutorialStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new HelloWorld(this, "hello-world");
  }
}
