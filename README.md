# Portal de publicações — Ederson Almeida

Sistema de blog e CMS para **Direito** e temas diversos: site público + painel admin (categorias estilo WordPress, publicações por tipo).

## Requisitos

- Node.js 20+
- npm

## Configuração

1. Copie `.env.example` para `.env` e ajuste:

   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login do painel (`/admin`)
   - `SESSION_SECRET` — string aleatória com pelo menos 32 caracteres
   - `DATABASE_URL` — local: `file:./dev.db` (relativo à pasta `prisma/`)

2. Instale dependências e prepare o banco:

```bash
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

Use **PostgreSQL** (SQLite não é adequado em filesystem efêmero). Altere `provider` em `prisma/schema.prisma` para `postgresql` e defina `DATABASE_URL` no serviço. Rode migrations no build (`prisma migrate deploy`).

Servidor Next.js: bind em `0.0.0.0` via `PORT` (padrão do `next start`).
