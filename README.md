# edpersonalmeida

Portal jurídico (Vite + React) com API Fastify, PostgreSQL (Neon) e deploy split: **Vercel** (front) + **Render** (API).

## Funcionalidades

- CRUD completo de publicações (rascunho, revisão, agendado, publicado, arquivado)
- Categorias com **subcategorias**, ícones e cores
- **Perfil** do usuário (OAB, bio, redes) e **configurações** (SEO, GA4/GTM, Google Ads, LGPD)
- Site público com visual **Direito** (navy/dourado, tipografia serif)
- SEO: meta tags, JSON-LD, `sitemap.xml`, `robots.txt`

## Desenvolvimento

```bash
cp .env.example .env
# Preencha DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- Site: http://localhost:5175  
- API: http://localhost:3333  

## Deploy

- **Vercel:** `vercel-build` gera `dist/` (SPA)
- **Render:** `npm run db:migrate -w @edpersonalmeida/api && npm run start:render`
- Defina `WEB_ORIGIN=https://edpersonalmeida.vercel.app` na API
