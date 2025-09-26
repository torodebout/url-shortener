import {
  CreateTableCommand,
  DescribeTableCommand,
  type DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

export async function ensureTables(ddb: DynamoDBClient): Promise<void> {
  const tables = [
    {
      TableName: 'urls',
      AttributeDefinitions: [
        { AttributeName: 'code', AttributeType: 'S' as const },
      ],
      KeySchema: [{ AttributeName: 'code', KeyType: 'HASH' as const }],
      BillingMode: 'PAY_PER_REQUEST' as const,
    },
    {
      TableName: 'url_metrics',
      AttributeDefinitions: [
        { AttributeName: 'code', AttributeType: 'S' as const },
      ],
      KeySchema: [{ AttributeName: 'code', KeyType: 'HASH' as const }],
      BillingMode: 'PAY_PER_REQUEST' as const,
    },
  ];

  for (const cfg of tables) {
    try {
      await ddb.send(new DescribeTableCommand({ TableName: cfg.TableName }));
    } catch (e: any) {
      if (e?.name === 'ResourceNotFoundException') {
        try {
          await ddb.send(new CreateTableCommand(cfg));
        } catch (ce: any) {
          if (ce?.name !== 'ResourceInUseException') {
            throw ce;
          }
        }
      } else {
        throw e;
      }
    }
  }
}
