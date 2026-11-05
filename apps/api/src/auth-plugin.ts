import type { FastifyInstance, FastifyRequest } from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: string };
    user: { sub: string; email: string; role: string };
  }
}

export async function authenticate(request: FastifyRequest) {
  await request.jwtVerify();
}

export function registerAuth(app: FastifyInstance) {
  app.decorate("authenticate", authenticate);
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}
