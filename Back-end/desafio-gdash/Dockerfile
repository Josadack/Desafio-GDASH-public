FROM node:20-alpine

WORKDIR /app

# Copia manifests
COPY package*.json ./

# PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instala dependências
RUN pnpm install --no-frozen-lockfile

# Copia o restante do código
COPY . .

# Build
RUN pnpm build

ENV NODE_ENV=production

# Render injeta a PORT automaticamente
EXPOSE 3000

CMD ["pnpm", "start:prod"]
