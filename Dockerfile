FROM node:20-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install
RUN npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL
ARG JWT_SECRET
ARG JWT_EXPIRES_IN_SECONDS
ARG MONGODB_URL
ARG STORE_DEFAULT_WHATSAPP
ARG STORE_DEFAULT_EMAIL
ARG STORE_DEFAULT_ADDRESS
ARG STORE_DEFAULT_COMPANY_NAME
ARG STORE_DEFAULT_CNPJ
ARG SEED_ADMIN_NAME
ARG SEED_ADMIN_EMAIL
ARG SEED_ADMIN_CPF
ARG SEED_ADMIN_PASSWORD
ARG GIT_SHA

ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN_SECONDS=$JWT_EXPIRES_IN_SECONDS
ENV MONGODB_URL=$MONGODB_URL
ENV STORE_DEFAULT_WHATSAPP=$STORE_DEFAULT_WHATSAPP
ENV STORE_DEFAULT_EMAIL=$STORE_DEFAULT_EMAIL
ENV STORE_DEFAULT_ADDRESS=$STORE_DEFAULT_ADDRESS
ENV STORE_DEFAULT_COMPANY_NAME=$STORE_DEFAULT_COMPANY_NAME
ENV STORE_DEFAULT_CNPJ=$STORE_DEFAULT_CNPJ
ENV SEED_ADMIN_NAME=$SEED_ADMIN_NAME
ENV SEED_ADMIN_EMAIL=$SEED_ADMIN_EMAIL
ENV SEED_ADMIN_CPF=$SEED_ADMIN_CPF
ENV SEED_ADMIN_PASSWORD=$SEED_ADMIN_PASSWORD
ENV GIT_SHA=$GIT_SHA

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run prisma:seed && npm run start -- -H 0.0.0.0 -p ${PORT}"]
