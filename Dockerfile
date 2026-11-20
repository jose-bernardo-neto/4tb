# syntax=docker/dockerfile:1
# Multi-stage build: deps -> build -> run
# Imagem para rodar o painel 4TB (opcionalmente com o bot WhatsApp via BOT_ENABLED=true).

FROM node:24-slim AS base
WORKDIR /app
ENV NODE_ENV=production \
    PNPM_HOME=/root/.local/share/pnpm \
    PATH=/root/.local/share/pnpm:$PATH \
    PUPPETEER_SKIP_DOWNLOAD=true
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    # libcups2-2 não existe no Debian/Ubuntu (base do node:slim); o pacote correto é libcups2
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcomposite1 \
    libxdamage1 \
    libxkbcommon0 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@12.21.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

FROM base AS run
WORKDIR /app
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
