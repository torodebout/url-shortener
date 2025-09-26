import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  type DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

export class UrlRepository {
  constructor(private ddb: DynamoDBDocumentClient) {}

  async createUrl(code: string, longUrl: string) {
    const now = new Date().toISOString();
    await this.ddb.send(
      new PutCommand({
        TableName: 'urls',
        Item: { code, long_url: longUrl, created_at: now, prefix: code[0] },
        ConditionExpression: 'attribute_not_exists(code)',
      })
    );
    return { code, long_url: longUrl, created_at: now };
  }

  async getUrl(code: string) {
    const out = await this.ddb.send(
      new GetCommand({
        TableName: 'urls',
        Key: { code },
      })
    );
    return (out.Item as any) || null;
  }

  async incrementClicks(code: string, delta = 1) {
    const now = new Date().toISOString();
    await this.ddb.send(
      new UpdateCommand({
        TableName: 'url_metrics',
        Key: { code },
        UpdateExpression:
          'SET first_click_at = if_not_exists(first_click_at, :now), last_click_at = :now ADD click_count :inc',
        ExpressionAttributeValues: { ':inc': delta, ':now': now },
      })
    );
  }

  async getMetrics(code: string) {
    const out = await this.ddb.send(
      new GetCommand({
        TableName: 'url_metrics',
        Key: { code },
      })
    );
    return (out.Item as any) || null;
  }
}
