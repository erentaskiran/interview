FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl

COPY package.json package-lock.json* tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/api/package.json ./services/api/package.json

RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json

COPY packages/shared ./packages/shared
COPY services/api ./services/api

RUN npm run build -w @ainterview/shared && \
    npm run prisma:generate -w @ainterview/api && \
    npm run build -w @ainterview/api

FROM node:22-alpine AS production
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/services/api/dist ./dist
COPY --from=builder /app/services/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
