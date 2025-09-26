FROM node:20-alpine
WORKDIR /app
COPY pnpm-workspace.yaml ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/redirect/package.json services/redirect/package.json
RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm -r install

COPY packages/shared packages/shared
COPY services/redirect services/redirect
COPY shared shared

RUN corepack enable && corepack prepare pnpm@9.10.0 --activate && pnpm --filter "@urlshortener/shared" --filter "urlshortener-redirect" install

WORKDIR /app/services/redirect
CMD ["node", "--import", "tsx", "src/server.ts"]
