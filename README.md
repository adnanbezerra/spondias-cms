# Spondias CMS

Base do monólito em Next.js para loja de plantas, com área pública SSR e APIs administrativas.

## O que já foi implementado

- Estrutura de domínio server-side em `src/server/*`.
- Padrão `Either` (`left`/`right`) para casos de uso.
- Repositórios com Prisma/PostgreSQL por padrão (sem armazenamento em memória no fluxo principal).
- Endpoints de autenticação:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Middleware/proxy protegendo `/admin/*` e `/api/admin/*` via token JWT.
- CRUD de categorias no admin:
  - `GET /api/admin/categories`
  - `POST /api/admin/categories`
  - `PATCH /api/admin/categories/:id`
  - `DELETE /api/admin/categories/:id`
- CRUD de seções no admin:
  - `GET /api/admin/sections`
  - `POST /api/admin/sections`
  - `PATCH /api/admin/sections/:id`
  - `DELETE /api/admin/sections/:id`
  - `PUT /api/admin/sections/:id/categories` (vínculo seção <-> categorias)
- CRUD de produtos no admin:
  - `GET /api/admin/products`
  - `POST /api/admin/products`
  - `PATCH /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
  - `PUT /api/admin/products/:id/sections` (vínculo produto <-> seções)
- Configuração institucional no admin:
  - `GET /api/admin/store-config`
  - `PUT /api/admin/store-config`
- Validação de entrada e saída com `zod`.
- Modelagem inicial Prisma em `prisma/schema.prisma`.
- Configuração Prisma 7 em `prisma.config.ts`.
- Variáveis obrigatórias documentadas em `.env.example`.

## Rodando localmente

```bash
npm install
cp .env.example .env
npm run prisma:generate
# opcional em ambiente com banco configurado:
# npm run prisma:migrate:dev
npm run dev
```

Abra `http://localhost:3000`.

## Observações

Se o ambiente bloquear acesso ao npm registry, a instalação de pacotes como `prisma` e `@prisma/client` pode falhar.
