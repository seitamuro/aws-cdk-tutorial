import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as AWS from "aws-sdk";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const s3 = new AWS.S3();
    if (!process.env.S3_BUCKET_NAME) {
      throw new Error("S3_BUCKET_NAME is not set");
    }
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: "test.txt",
    };
    const body = await s3.getObject(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully read from S3!",
        body: body.Body?.toString(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Failed to upload to S3: ${error}`,
      }),
    };
  }
};
