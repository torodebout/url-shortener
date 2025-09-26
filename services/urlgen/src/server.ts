import {
  loadPackageDefinition,
  Server,
  ServerCredentials,
} from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  createClients,
  ensureTables,
  UrlRepository,
  nextId,
} from '@urlshortener/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROTO_PATH = join(__dirname, '../../../shared/proto/urls.proto');

const packageDef = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
});
const proto = loadPackageDefinition(packageDef) as any;

async function main() {
  const server = new Server();
  const { ddb, ddbDoc, redis } = await createClients();
  await ensureTables(ddb);
  const repo = new UrlRepository(ddbDoc);
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  const UrlGen = proto.urlshortener.UrlGen;

  server.addService(UrlGen.service, {
    Shorten: async (call: any, callback: any) => {
      const longUrl: string = call.request.long_url;
      try {
        const u = new URL(longUrl);
        if (!['http:', 'https:'].includes(u.protocol))
          return callback(null, {
            code: '',
            short_url: '',
            long_url: '',
            created_at: '',
          });
      } catch {
        return callback(null, {
          code: '',
          short_url: '',
          long_url: '',
          created_at: '',
        });
      }
      for (let i = 0; i < 3; i++) {
        const code = nextId();
        try {
          const rec = await repo.createUrl(code, longUrl);
          await redis.setex(`url:${code}`, 24 * 3600, rec.long_url);
          return callback(null, {
            code,
            short_url: `${baseUrl}/${code}`,
            long_url: rec.long_url,
            created_at: rec.created_at,
          });
        } catch (e: any) {
          if (e?.name !== 'ConditionalCheckFailedException') return callback(e);
        }
      }
      return callback(new Error('internal_error'));
    },
  });

  const port = process.env.URLGEN_PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${port}`,
    ServerCredentials.createInsecure(),
    (err) => {
      if (err) throw err;
      console.log(`urlgen gRPC listening on ${port}`);
      server.start();
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
