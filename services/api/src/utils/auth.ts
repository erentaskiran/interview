import type { FastifyRequest } from "fastify";

type JwtLikeUser = {
  sub: string;
  email?: string;
};

export const getAuthUser = (request: FastifyRequest): JwtLikeUser =>
  request.user as JwtLikeUser;

export const getAuthUserId = (request: FastifyRequest): string =>
  getAuthUser(request).sub;
