
FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && curl -fsSL https://vite.plus | bash \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.vite-plus/bin:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./apps/server/package.json /app/apps/server/package.json

RUN vp install --frozen-lockfile --ignore-scripts

COPY . .

RUN vp run server#build

FROM gcr.io/distroless/nodejs24-debian13

WORKDIR /app

COPY --from=builder /app/apps/server/dist ./

CMD ["/app/index.mjs"]
