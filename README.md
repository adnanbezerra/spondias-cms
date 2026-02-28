# Spondias CMS

Base do monólito em Next.js para loja de plantas, com área pública SSR e APIs administrativas.

## O que já foi implementado

- Estrutura de domínio server-side em `src/server/*`.
- Padrão `Either` (`left`/`right`) para casos de uso.
- Endpoints de autenticação:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Middleware/proxy protegendo `/admin/*` e `/api/admin/*` via token JWT.
- CRUD inicial de categorias no admin:
  - `GET /api/admin/categories`
  - `POST /api/admin/categories`
  - `PATCH /api/admin/categories/:id`
  - `DELETE /api/admin/categories/:id`
- Configuração institucional no admin:
  - `GET /api/admin/store-config`
  - `PUT /api/admin/store-config`
- Validação de entrada e saída com `zod`.
- Modelagem inicial Prisma em `prisma/schema.prisma`.
- Variáveis obrigatórias documentadas em `.env.example`.

## Rodando localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Abra `http://localhost:3000`.

## Observações

Se o ambiente bloquear acesso ao npm registry, a instalação de pacotes como `prisma` e `@prisma/client` pode falhar.
