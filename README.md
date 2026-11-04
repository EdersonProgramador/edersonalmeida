# Portal de publicações — Ederson Almeida

Sistema de blog e CMS para **Direito** e temas diversos: site público + painel admin (categorias estilo WordPress, publicações por tipo).

## Requisitos

- Node.js 20+
- npm

## Configuração

1. Copie `.env.example` para `.env` e ajuste:

   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login do painel (`/admin`)
   - `SESSION_SECRET` — string aleatória com pelo menos 32 caracteres
   - `DATABASE_URL` — PostgreSQL (local: `docker compose up -d` e use a URL do `.env.example`)

2. Instale dependências e prepare o banco:

```bash
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
```

3. Desenvolvimento:

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Fluxo de conteúdo

1. **Admin → Categorias** — crie assuntos (ex.: Direito Penal, Temas diversos).
2. **Admin → Publicações** — editor visual (WYSIWYG), upload de imagens e capa, vários autores.
3. **Admin → Autores** — cadastro de autores (nome, bio, foto).
4. Status **Rascunho** ou **Publicado**; só publicados aparecem no site.
5. URLs: `/categoria/[slug]` e `/publicacao/[slug]`.

**Uploads:** arquivos vão para `public/uploads/` (ideal em desenvolvimento). No Render, use disco persistente ou armazenamento externo — o filesystem do serviço é efêmero.

## Deploy (Render)

Use o **`render.yaml`** (Postgres + web) ou crie um Postgres no Render e defina `DATABASE_URL`, `SESSION_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`. O build já roda `prisma migrate deploy`. Depois do primeiro deploy: `npm run db:seed` via shell do Render (ou adicione release command).

Servidor Next.js: bind em `0.0.0.0` via `PORT` (padrão do `next start`).
