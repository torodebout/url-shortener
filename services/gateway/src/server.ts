import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { loadPackageDefinition, credentials } from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROTO_PATH = join(__dirname, '../../../shared/proto/urls.proto');
const packageDef = loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  defaults: true,
});
const proto = loadPackageDefinition(packageDef) as any;

const app = Fastify({ logger: true });

async function main() {
  await app.register(fastifyStatic, {
    root: join(__dirname, '../../../public'),
    prefix: '/',
    index: ['index.html'],
  });

  app.get('/', async (_req, reply) => {
    return (reply as any).sendFile('index.html');
  });

  const urlgen = new proto.urlshortener.UrlGen(
    'urlgen:50051',
    credentials.createInsecure()
  );
  const redirect = new proto.urlshortener.Redirect(
    'redirect:50052',
    credentials.createInsecure()
  );
  const analytics = new proto.urlshortener.Analytics(
    'analytics:50053',
    credentials.createInsecure()
  );

  app.post('/api/urls/shorten', async (req, reply) => {
    const body = (req.body as any) || {};
    const long_url = body.longUrl;
    const res = await new Promise<any>((resolve, reject) => {
      urlgen.Shorten({ long_url }, (err: any, resp: any) =>
        err ? reject(err) : resolve(resp)
      );
    });
    if (!res || !res.code)
      return reply.code(400).send({ error: 'invalid_url' });
    return reply.code(201).send({
      shortUrl: res.short_url,
      code: res.code,
      longUrl: res.long_url,
      createdAt: res.created_at,
    });
  });

  app.get('/:code([A-Za-z0-9]{6,8})', async (req, reply) => {
    const code = (req.params as any).code;
    const res = await new Promise<any>((resolve, reject) => {
      redirect.Resolve({ code }, (err: any, resp: any) =>
        err ? reject(err) : resolve(resp)
      );
    });
    if (!res?.found) return reply.code(404).send({ error: 'not_found' });
    new Promise<void>((resolve) => {
      analytics.IncrementClick({ code, delta: 1 }, (_err: any) => resolve());
    }).catch(() => {});
    reply.header('Location', res.long_url);
    reply.header('Cache-Control', 'no-store');
    return reply.code(302).send();
  });

  app.get('/api/urls/:code', async (req, reply) => {
    const code = (req.params as any).code;
    const res = await new Promise<any>((resolve, reject) => {
      analytics.GetMetrics({ code }, (err: any, resp: any) =>
        err ? reject(err) : resolve(resp)
      );
    });
    if (!res?.found) return reply.code(404).send({ error: 'not_found' });
    return { longUrl: res.long_url };
  });

  app.get('/api/urls/:code/metrics', async (req, reply) => {
    const code = (req.params as any).code;
    const res = await new Promise<any>((resolve, reject) => {
      analytics.GetMetrics({ code }, (err: any, resp: any) =>
        err ? reject(err) : resolve(resp)
      );
    });
    if (!res?.found) return reply.code(404).send({ error: 'not_found' });
    return {
      code,
      longUrl: res.long_url,
      clickCount: res.click_count,
      firstClickAt: res.first_click_at || null,
      lastClickAt: res.last_click_at || null,
    };
  });

  app.get('/health', async (_req, _reply) => ({ ok: true }));

  const port = Number(process.env.PORT || 3000);
  await app.listen({ port, host: '0.0.0.0' });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
