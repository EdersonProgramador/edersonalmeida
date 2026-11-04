import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./env.js";
import { registerCmsRoutes, uploadRoot } from "./routes/cms.routes.js";

const app = Fastify({ logger: true, trustProxy: true });

const origins = new Set(
  env.WEB_ORIGIN.split(",")
    .map((o) => o.trim())
    .filter(Boolean),
);

await app.register(cors, {
  origin(origin, cb) {
    if (!origin || origins.has(origin)) {
      cb(null, true);
      return;
    }
    if (/^https?:\/\/(localhost|127\.0\.0\.1):\d+$/i.test(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("CORS"), false);
  },
  credentials: true,
});

await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });
await app.register(jwt, { secret: env.JWT_SECRET });
await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });

const uploads = uploadRoot();
await app.register(fastifyStatic, {
  root: uploads,
  prefix: "/uploads/",
  decorateReply: false,
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return reply.code(400).send({ message: first?.message ?? "Dados inválidos." });
  }
  const statusCode =
    "statusCode" in error && typeof error.statusCode === "number" ? error.statusCode : 500;
  if (statusCode >= 500) app.log.error(error);
  return reply.code(statusCode).send({ message: error.message || "Erro interno." });
});

app.get("/health", async () => ({ ok: true }));

await registerCmsRoutes(app);

const port = env.API_PORT;
await app.listen({ port, host: "0.0.0.0" });
