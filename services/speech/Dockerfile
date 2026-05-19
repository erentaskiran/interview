FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* tsconfig.base.json ./
COPY services/speech/package.json ./services/speech/package.json

RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/tsconfig.base.json ./tsconfig.base.json

COPY services/speech ./services/speech

RUN npm run build -w @ainterview/speech

FROM node:22-alpine AS production
WORKDIR /app

COPY --from=builder /app/services/speech/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 4001
CMD ["node", "dist/index.js"]
