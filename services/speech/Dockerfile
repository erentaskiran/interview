FROM node:22-alpine AS base
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY services/speech/package.json ./services/speech/package.json

RUN npm install

COPY services/speech ./services/speech

RUN npm run build -w @ainterview/speech

WORKDIR /app/services/speech
EXPOSE 4001
CMD ["node", "dist/index.js"]
