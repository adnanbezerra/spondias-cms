# Plano de Execução - Spondias CMS

## 1. Objetivo
Construir um monólito em Next.js para loja de plantas com:
- Área pública SSR (site principal)
- Área administrativa (gestão de conteúdo e produtos)
- Backend server-side com PostgreSQL + Prisma + JWT
- Fluxo de compra sem checkout, sempre redirecionando para WhatsApp

## 2. Princípios e Restrições
- UX simples e direta.
- Renderização server-side nas páginas principais para navegação rápida.
- APIs e acesso ao banco somente no servidor.
- Prioridade máxima para prevenção de vazamento de dados.
- Configurações de contato e rodapé gerenciáveis no admin.
- Identidade visual obrigatória:
  - Logo oficial em `public/logo.jpg`.
  - Cor primária: `#DBD7CB`.
  - Cor secundária: `#334D40`.

## 3. Escopo Funcional
## Área pública
- Home em formato feed com seções ativas ordenadas.
- Topbar com navegação para páginas de categorias.
- Listagem de produtos por seção/categoria.
- Botões "Comprar agora" redirecionando para WhatsApp.
- Ícone flutuante de WhatsApp visível no site.
- Footer com email, WhatsApp, endereço, razão social, CNPJ e dados configuráveis.
- Suporte a seções tipo banner promocional.

## Área administrativa
- Login e sessão autenticada por JWT.
- Configuração geral (WhatsApp, endereço, email, empresa, CNPJ etc.).
- CRUD de categorias.
- CRUD de seções (incluindo ordem, ativo/inativo e banner).
- CRUD de produtos.
- Relacionamento N:N entre produtos e seções.
- Relacionamento N:N entre seções e categorias.
- Upload de imagens para bucket (provedor a definir).

## 4. Modelagem de Dados (Prisma)
## Entidades base
- `User`: `id(uuid)`, `email(unique)`, `cpf(unique)`, `passwordHash`, `isActive`, `createdAt`, `updatedAt`
- `Section`: `id(uuid)`, `name`, `isActive`, `order`, `isBanner`, `bannerImg`, `createdAt`, `updatedAt`
- `Category`: `id(uuid)`, `name`, `isActive`, `createdAt`, `updatedAt`
- `Product`: `id(uuid)`, `name`, `price` (centavos), `stock`, `discountPercentage`, `image`, `isActive`, `createdAt`, `updatedAt`

## Relacionamentos
- `ProductSection` (tabela pivô): `productId`, `sectionId`
- `SectionCategory` (tabela pivô): `sectionId`, `categoryId`

## Configuração global
- Criar entidade `StoreConfig` para dados institucionais e de contato:
  - `whatsappNumber`, `email`, `address`, `companyName`, `cnpj`, `updatedAt`

## 5. Arquitetura (Next.js App Router)
- `app/(public)` para páginas públicas SSR.
- `app/(admin)` para dashboard autenticado.
- `app/api/*` para endpoints server-side.
- Camada de domínio em `src/server/*`:
  - `auth`, `repositories`, `services`, `validators`, `security`.
- Prisma client singleton (`src/server/db/prisma.ts`).

## 5.1. Padrões Técnicos Obrigatórios
- Em toda regra de negócio/API, usar padrão de retorno com mônada `Either`.
- Fluxo de sucesso deve retornar `right`.
- Fluxo de erro deve retornar `left` com erro tipado.
- Controllers/route handlers devem apenas traduzir `Either` para HTTP status + payload.
- Usar `zod` em 100% das fronteiras de entrada e saída:
  - `body`, `params`, `query`, `headers` e validação de resposta quando aplicável.

## 6. Segurança (Obrigatório)
- Hash de senha com `bcrypt`/`argon2`.
- JWT assinado com segredo forte em variável de ambiente.
- Validação com `zod` em todas as rotas e contratos de dados.
- Sanitização e validação de upload (tipo, tamanho, extensão).
- Rate limit em autenticação e endpoints críticos.
- Middleware para proteger rotas `/admin` e `/api/admin/*`.
- Respostas sem detalhes sensíveis (não vazar stack/SQL/errors internos).
- Princípio de menor privilégio no usuário do banco.
- Logs de auditoria para ações administrativas relevantes.

## 7. Fases de Implementação
## Fase 0 - Base do projeto
- Definir estrutura de pastas (public/admin/server/components).
- Configurar `.env.example` com variáveis obrigatórias.
- Instalar dependências: Prisma, pg, zod, JWT, hash, upload SDK.
- Criar utilitários centrais (errors tipados, `Either`, response helpers, auth helpers).

## Fase 1 - Banco e Prisma
- Modelar schema Prisma com entidades e pivôs.
- Rodar primeira migration.
- Criar seed inicial (admin padrão + config default opcional).
- Garantir índices e constraints relevantes.

## Fase 2 - Auth server-side
- Endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Implementar casos de uso retornando `Either<Error, Success>`.
- Validar entrada/saída com schemas `zod`.
- Emissão/validação de JWT.
- Middleware de proteção para admin.
- Testar cenários de falha e sucesso.

## Fase 3 - CRUD de conteúdo (admin API)
- CRUD de categorias.
- CRUD de seções (com ordenação e modo banner).
- CRUD de produtos.
- Padronizar todos os casos de uso e handlers com `Either` (`left/right`).
- Validar todos os contratos com `zod`.
- Endpoints de vínculo:
  - produto <-> seções
  - seção <-> categorias
- CRUD de `StoreConfig`.

## Fase 4 - Upload de imagens
- Definir provedor de bucket (S3, Cloudinary, Supabase Storage etc.).
- Endpoint de upload autenticado no admin.
- Persistir URL da imagem no banco.
- Regras de segurança e limite de tamanho.

## Fase 5 - Interface administrativa
- Tela de login.
- Dashboard com menus: Configuração, Categorias, Seções, Produtos.
- Formulários simples com validação e mensagens de erro.
- Gestão de relacionamentos entre entidades.

## Fase 6 - Interface pública SSR
- Home SSR com feed de seções ativas por ordem.
- Renderização de banner quando `isBanner = true`.
- Páginas por categoria.
- Cards de produto com preço, desconto, estoque e CTA de WhatsApp.
- Botão flutuante de WhatsApp global no layout.
- Footer dinâmico com `StoreConfig`.
- Aplicar identidade visual da marca (logo + cores primária/secundária).

## Fase 7 - Qualidade e hardening
- Testes mínimos (unit + integração API crítica).
- Revisão de headers de segurança.
- Tratamento consistente de erros.
- Verificação de performance SSR e queries N+1.
- Checklist de deploy e rollback.

## 8. Definições Pendentes
- Provedor do bucket de imagens.
- Formato do CPF (normalizado com/sem máscara).
- Estratégia de expiração/refresh de JWT.
- Estratégia de envio do JWT (cookie httpOnly vs header Bearer).
- Regras de preço promocional e cálculo final no frontend.

## 9. Critérios de Aceite (MVP)
- Admin autenticado consegue criar/editar/remover categorias, seções e produtos.
- Admin consegue definir dados institucionais e WhatsApp.
- Home pública SSR renderiza conteúdo configurado.
- Todas as ações de compra levam ao WhatsApp com link correto.
- Ícone flutuante de WhatsApp aparece em todas as páginas públicas.
- Nenhum endpoint de administração responde sem autenticação válida.
- Todas as APIs usam `Either` com retorno explícito `left`/`right`.
- Todas as entradas e contratos críticos das APIs são validados com `zod`.
- Identidade visual aplicada com `public/logo.jpg`, cor primária `#DBD7CB` e secundária `#334D40`.

## 10. Sequência Recomendada de Execução
1. Fase 0 e Fase 1 (infra + banco).
2. Fase 2 (auth) antes de qualquer CRUD administrativo.
3. Fase 3 e Fase 4 (conteúdo + uploads).
4. Fase 5 e Fase 6 em paralelo leve (admin/public).
5. Fase 7 para estabilização final.
