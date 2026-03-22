FROM node:24-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && curl -fsSL https://vite.plus | bash \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.vite-plus/bin:$PATH"

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY ./apps/web/package.json /app/apps/web/package.json

RUN vp install --frozen-lockfile --ignore-scripts

COPY . .

RUN vp run web#build

FROM nginx:alpine

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
