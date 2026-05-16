FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY services/api/package.json ./services/api/package.json

RUN npm install

COPY packages/shared ./packages/shared
COPY services/api ./services/api

RUN npm run build -w @ainterview/shared && npm run prisma:generate -w @ainterview/api && npm run build -w @ainterview/api

WORKDIR /app/services/api
EXPOSE 4000
CMD ["node", "dist/index.js"]
