import { SQS } from "aws-sdk";
import { SendMessageBatchRequest } from "aws-sdk/clients/sqs";

export class sqsClient {
  public async send(messages: MyDto[], size: number = 10): Promise<void> {
    const chunks = this.chunk<MyDto>(messages, size);
    const sqs = new SQS({ region: process.env.AWS_REGION });

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const params: SendMessageBatchRequest = {
        QueueUrl: process.env.QueueUrl,
        Entries: chunk.map((message: MyDto) => ({
          Id: message.uniqueId,
          MessageBody: JSON.stringify(message)
        }))
      };
      await sqs.sendMessageBatch(params).promise();
    }
  }

  private chunk<T>(array: T[], size: number): T[][] {
    const chunked_arr: T[][] = [];
    let index = 0;
    while (index < array.length) {
      chunked_arr.push(array.slice(index, size + index));
      index += size;
    }
    return chunked_arr;
  }
}