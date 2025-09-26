FROM node:20-alpine
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/gateway/package.json services/gateway/package.json
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm -r install

COPY packages/shared packages/shared
COPY services/gateway services/gateway
COPY public public
COPY shared shared

RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm --filter "@urlshortener/shared" --filter "urlshortener-gateway" install

WORKDIR /app/services/gateway
CMD ["node", "--import", "tsx", "src/server.ts"]
