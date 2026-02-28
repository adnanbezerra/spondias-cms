# Spondias CMS

Base do monólito em Next.js para loja de plantas, com área pública SSR e base de APIs administrativas.

## O que já foi implementado

- Estrutura de domínio server-side em `src/server/*`.
- Padrão `Either` (`left`/`right`) para casos de uso.
- Endpoints de autenticação:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Validação de entrada e saída com `zod`.
- Middleware protegendo `/admin/*` e `/api/admin/*` via token JWT.
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

Para ativar a camada de banco com Prisma, é necessário instalar `prisma` e `@prisma/client` no ambiente com acesso ao registro npm.
