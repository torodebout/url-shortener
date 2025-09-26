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
  const svc = {
    Resolve: async (call: any, callback: any) => {
      const code: string = String(call.request.code || '');
      if (!code) return callback(null, { found: false, long_url: '' });
      const cached = await redis.get(`url:${code}`);
      if (cached) return callback(null, { found: true, long_url: cached });
      const rec = await repo.getUrl(code);
      if (!rec) return callback(null, { found: false, long_url: '' });
      await redis.setex(`url:${code}`, 24 * 3600, rec.long_url);
      return callback(null, { found: true, long_url: rec.long_url });
    },
  };
  server.addService(proto.urlshortener.Redirect.service, svc);

  const port = process.env.REDIRECT_PORT || '50052';
  server.bindAsync(
    `0.0.0.0:${port}`,
    ServerCredentials.createInsecure(),
    (err) => {
      if (err) throw err;
      console.log(`redirect gRPC listening on ${port}`);
      server.start();
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
