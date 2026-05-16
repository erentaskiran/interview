# AInterview MVP

Monorepo structure:

- `apps/web`: React + Vite frontend
- `services/api`: Fastify + Prisma adaptive interview API
- `services/speech`: Fastify Deepgram TTS/STT service
- `packages/shared`: Shared TypeScript types

## Quick start

1. Copy env files:
   - `cp services/api/.env.example services/api/.env`
   - `cp services/speech/.env.example services/speech/.env`
   - `cp apps/web/.env.example apps/web/.env`
2. Install dependencies:
   - `npm install`
3. Start PostgreSQL:
   - `docker compose up -d postgres`
4. Run migrations and generate Prisma client:
   - `npm run prisma:migrate`
   - `npm run prisma:generate`
5. Run services:
   - `npm run dev:speech`
   - `npm run dev:api`
   - `npm run dev:web`

## Core APIs

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /templates`
- `GET /templates`
- `GET /templates/:id`
- `POST /templates/:id/like`
- `DELETE /templates/:id/like`
- `GET /users/:id/profile`
- `POST /users/:id/follow`
- `DELETE /users/:id/follow`
- `POST /sessions`
- `POST /sessions/:id/answer`
- `POST /sessions/:id/finish`
- `GET /sessions/:id`

## Adaptive session rules

- Backend bounds questions to `min=3` and `max=12`.
- AI can request finish only after minimum answered questions.
- Max-question guard finalizes automatically at max limit.
- Manual finish is allowed only after at least one answered turn.
- Final `completionReason` values: `ai_completed`, `user_stopped`, `failed`.
