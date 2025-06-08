# # Multi-stage build for production
# FROM node:18-alpine AS deps
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci --only=production

# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm ci
# COPY . .
# ENV NODE_OPTIONS=--max-old-space-size=2048
# ENV NODE_ENV=production
# RUN npm run build

# FROM node:18-alpine AS runner
# WORKDIR /app

# ENV NODE_ENV=production
# ENV NODE_OPTIONS=--max-old-space-size=1024

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# COPY --from=builder /app/public ./public
# COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static



# EXPOSE 3000

# ENV PORT 3000
# ENV HOSTNAME "0.0.0.0"

# CMD ["node", "server.js"]

# frontend/Dockerfile
# syntax=docker/dockerfile:1.4

######### 1: deps stage #########
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

######### 2: build stage #########
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

######### 3: runner stage #########
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# only prod deps
COPY package*.json ./
RUN npm ci --omit=dev
# copy next build outputs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "run", "start"]
