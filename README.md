# Portal de publicações — Ederson Almeida

Monorepo no mesmo padrão da agência / Atlly:

- **Vercel** — SPA **Vite + React** (`apps/web`)
- **Render** — **Fastify** + **PostgreSQL** + Prisma (`apps/api`)

Site público + admin (JWT, editor WYSIWYG, categorias, autores, upload).

## Requisitos

- Node.js 20+
- PostgreSQL local (ou URL remota) para a API

## Configuração local

1. Copie `.env.example` para `.env` na raiz (a API carrega `../../.env` em dev).

2. Instale e migre:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

3. Suba web + API:

```bash
npm run dev
```

- Site: [http://localhost:5175](http://localhost:5175)
- API: [http://localhost:3333/health](http://localhost:3333/health)
- Admin: [http://localhost:5175/admin](http://localhost:5175/admin) (login = `ADMIN_EMAIL` / `ADMIN_PASSWORD`)

Em dev, o Vite faz proxy de `/public`, `/admin`, `/auth`, `/uploads` para a API.

## Deploy

### Render (API + Postgres)

Use `render.yaml` ou configure manualmente:

- **Build:** `npm ci && npm run build:api:render`
- **Start:** `npm run prisma:deploy --workspace=@edersonalmeida/api && npm run prisma:seed --workspace=@edersonalmeida/api && npm run start --workspace=@edersonalmeida/api`
- **Health:** `/health`
- Env: `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `WEB_ORIGIN` (URLs da Vercel + localhost), `UPLOAD_ROOT=/var/data/uploads` + disco em `/var/data`

### Vercel (front)

- **Build:** `npm run vercel-build` (gera `./dist` a partir de `apps/web/dist`)
- Env: **`VITE_API_URL`** = URL pública da API no Render (sem barra final)

## Legado

A pasta `src/` com **Next.js** permanece no repositório como referência; o deploy oficial usa `apps/web` + `apps/api`.
