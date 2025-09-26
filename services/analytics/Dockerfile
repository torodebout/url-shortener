FROM node:20-alpine
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/analytics/package.json services/analytics/package.json
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm -r install

COPY packages/shared packages/shared
COPY services/analytics services/analytics
COPY shared shared

RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm --filter "@urlshortener/shared" --filter "urlshortener-analytics" install

WORKDIR /app/services/analytics
CMD ["node", "--import", "tsx", "src/server.ts"]
