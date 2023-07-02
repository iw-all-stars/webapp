FROM --platform=linux/amd64 node:18-alpine3.17 AS base

##### DEPENDENCIES

FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma Client - remove if not using Prisma

COPY prisma ./

# Install dependencies based on the preferred package manager

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml\* ./

RUN yarn --frozen-lockfile

##### BUILDER

FROM base AS builder

ARG DATABASE_URL
ARG NEXT_PUBLIC_CLIENTVAR
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG ACCESS_KEY_S3
ARG SECRET_KEY_S3
ARG BUCKET_NAME
ARG AWS_ACCESS_KEY_ID_EVENT
ARG AWS_SECRET_ACCESS_KEY_EVENT
ARG ARN_LAMBDA_FUNCTION_PUBLISH_POST
ARG ROLE_ARN_EVENT_BRIDGE_SCHEDULER
ARG AWS_REGION
ARG PASSWORD_ENCRYPTION_KEY
ARG API_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG SENDINBLUE_API_KEY
ARG NEXT_PUBLIC_MAIL_TEMPLATE_CAMPAIGN_ID
ARG SKIP_ENV_VALIDATION
ARG MAIL_TEMPLATE_CAMPAIGN_ID

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build

##### RUNNER

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["sh", "-c", "yarn generate && yarn prisma db push && node server.js"]
