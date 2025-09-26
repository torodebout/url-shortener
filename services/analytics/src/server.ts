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
  const { ddb, ddbDoc } = await createClients();
  await ensureTables(ddb);
  const repo = new UrlRepository(ddbDoc);

  server.addService(proto.urlshortener.Analytics.service, {
    GetMetrics: async (call: any, callback: any) => {
      const code: string = call.request.code;
      const m = await repo.getMetrics(code);
      if (!m) return callback(null, { found: false });
      const url = await repo.getUrl(code);
      return callback(null, {
        found: true,
        code,
        long_url: url?.long_url || '',
        click_count: m.click_count || 0,
        first_click_at: m.first_click_at || '',
        last_click_at: m.last_click_at || '',
      });
    },
    IncrementClick: async (call: any, callback: any) => {
      const { code, delta } = call.request;
      await repo.incrementClicks(code, delta || 1);
      callback(null, {});
    },
  });

  const port = process.env.ANALYTICS_PORT || '50053';
  server.bindAsync(
    `0.0.0.0:${port}`,
    ServerCredentials.createInsecure(),
    (err) => {
      if (err) throw err;
      console.log(`analytics gRPC listening on ${port}`);
      server.start();
    }
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
