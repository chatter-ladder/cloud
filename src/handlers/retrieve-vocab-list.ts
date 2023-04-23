import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { Logger } from '@aws-lambda-powertools/logger';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const logger = new Logger();
const dbClient = new DynamoDBClient({ region: 'eu-west-2' });

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('in lambda handler');
  const tableName = process.env['VOCAB_TABLE_NAME'];
  logger.info('table', { tableName });
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'userId = :id',
    ExpressionAttributeValues: { ':id': { S: 'user123' } },
  };
  logger.info('params', { params });
  try {
    const { Items } = await dbClient.send(new QueryCommand(params));
    logger.info('users vocab:', { Items });
    return {
      statusCode: 200,
      body: JSON.stringify({ Items }),
    };
  } catch (error) {
    logger.error('Failed to retrieve vocab list', { error });
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Vocab items not retrieved',
      }),
    };
  }
};
