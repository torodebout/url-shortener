FROM node:20-alpine
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/urlgen/package.json services/urlgen/package.json
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm -r install

COPY packages/shared packages/shared
COPY services/urlgen services/urlgen
COPY shared shared

RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm --filter "@urlshortener/shared" --filter "urlshortener-urlgen" install

WORKDIR /app/services/urlgen
CMD ["node", "--import", "tsx", "src/server.ts"]
