import { Redis } from 'ioredis';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export async function createClients() {
  const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

  const ddb = new DynamoDBClient({
    region: process.env.AWS_REGION || 'local',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
    },
  });

  const ddbDoc = DynamoDBDocumentClient.from(ddb, {
    marshallOptions: { removeUndefinedValues: true },
  });

  return { redis, ddb, ddbDoc };
}
