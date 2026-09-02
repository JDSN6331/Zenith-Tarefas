# Estágio de Build
FROM node:22-alpine AS builder

WORKDIR /app

ENV NITRO_PRESET=node-server

# Copia manifestos de dependências
COPY package.json package-lock.json* ./

# Instala todas as dependências (incluindo devDependencies como Vite para o build)
RUN npm install --include=dev --legacy-peer-deps

# Copia código-fonte
COPY . .

# Executa build de produção
RUN npm run build

# Estágio de Execução (Produção)
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copia artefatos compilados do Nitro/Vite
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
