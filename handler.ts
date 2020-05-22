import { SQSEvent, SQSRecord } from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS({ region: process.env.AWS_REGION });

export const startExecution = async (event: SQSEvent): Promise<any> => {
  const succeedSqsMessages = [];
  let somethingHasFailed = false;
  for (const record of event.Records) {
    try {
      await doSomething(JSON.parse(record.body));
      succeedSqsMessages.push({
        Id: record.messageId,
        ReceiptHandle: record.receiptHandle
      });
    } catch (error) {
      // do something with the error
      somethingHasFailed = true;
    }
  }

  if (somethingHasFailed) {
    // delete the success one
    await sqs.deleteMessageBatch({
      Entries: succeedSqsMessages,
      QueueUrl: "your_sqs_url"
    }).promise();
    throw new Error("Partial batch failure");
  }
  return "OK";
};