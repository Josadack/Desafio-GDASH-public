FROM node:20-alpine

WORKDIR /app

# Copia os manifests
COPY package*.json ./

# Instala PNPM
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instala dependências
RUN pnpm install --no-frozen-lockfile

# Copia o restante do código
COPY . .

# Build do NestJS
RUN pnpm build

# Instala curl + bash e baixa wait-for-it
RUN apk add --no-cache curl bash \
    && curl -o /wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh \
    && chmod +x /wait-for-it.sh

ENV NODE_ENV=production

EXPOSE 3000

# Aguarda o MongoDB e inicia a aplicação em modo produção
CMD ["/wait-for-it.sh", "mongo:27017", "--", "pnpm", "start:prod"]
