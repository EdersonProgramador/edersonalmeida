# Portal de publicações — Ederson Almeida

Sistema de blog e CMS para **Direito** e temas diversos: site público + painel admin (categorias estilo WordPress, publicações por tipo).

## Requisitos

- Node.js 20+
- npm

## Configuração local

1. Copie `.env.example` para `.env` e ajuste:

   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — login do painel (`/admin`)
   - `SESSION_SECRET` — string aleatória com pelo menos 32 caracteres
   - `DATABASE_URL` — `file:./dev.db` (SQLite na pasta `prisma/`)

2. Banco e seed:

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

1. **Admin → Categorias** — crie assuntos (disciplinas da faculdade).
2. **Admin → Publicações** — editor visual (WYSIWYG), upload de imagens e capa, vários autores.
3. **Admin → Autores** — cadastro de autores (nome, bio, foto).
4. Status **Rascunho** ou **Publicado**; só publicados aparecem no site.
5. URLs: `/categoria/[slug]` e `/publicacao/[slug]`.

## Deploy (Render)

Use o **`render.yaml`** no repositório (Blueprint) ou configure manualmente:

| Variável | Valor |
|----------|--------|
| `DATABASE_URL` | `file:/var/data/app.db` |
| `SESSION_SECRET` | gerada ou string longa |
| `ADMIN_EMAIL` | seu e-mail admin |
| `ADMIN_PASSWORD` | sua senha |
| `UPLOAD_DIR` | `/var/data/uploads` |

- **Disco persistente** 1 GB em `/var/data` (obrigatório para SQLite e uploads).
- **Build:** `npm install && npm run build`
- **Start:** `npm run start:render` (aplica migrations + seed e sobe o Next)

Servidor: bind em `0.0.0.0` via `PORT` (padrão do `next start`).

**Opcional:** Postgres local com `docker compose up -d` — exige trocar `provider` em `prisma/schema.prisma` para `postgresql` e migrations compatíveis.
