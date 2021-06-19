# SQS batch size #

Often, I see people using SQS + Lambda with batch set to 1 and complain later about serverless. 
Serverless has its limitations, but there are little things that we can do to improve the experience. One of these is the SQS batch size.
By default is 10, and using this small batch size, we are increasing throughput and reducing cost at the same time that is always good.

### Your best friends ###

* [SendMessageBatch](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_SendMessageBatch.html)
* [DeleteMessageBatch](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_DeleteMessageBatch.html)


### SQS pricing ###

Because we [pay](https://aws.amazon.com/sqs/pricing/) per request batch is the logical way to go.

### Downside of batch ###

Batching is coming with a slight downside so, when SQS trigger a Lambda with default batch size, we don't have a magic way to find out which message has failed and should remain on the queue, and this means that if we don't handle it, all messages in the batch will go back in the queue and invoked again.

### Possible solutions ###

* Make the lambda idempotent
* When it fails, move to DLQ and manage this queue 
* Handle the failure of a single message

"In computing, an idempotent operation has no additional effect if it is called more than once with the same input parameters ".
It is easier said than done that the code must adequately validate the input and identify if the information has been already processed. 
[Here](https://aws.amazon.com/premiumsupport/knowledge-center/lambda-function-idempotent/) you find more info.

Moving the entire batch into the DLQ and processed again, maybe one by one, can be done, but it is more logical to handle, extra Lambda to deploy etc.

To me, the easier way is to handle the failure in the Lambda. As you can see in the example (not very nice), I have a try-catch where I manage the exception and mark that something wrong happened, and later on, I delete the successful and throwing so that the bad ones will go back in the queue where we ca retry or just move them into a DLQ.
