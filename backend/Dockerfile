# FROM node:20-alpine AS deps
# WORKDIR /app
# COPY package*.json ./
# # Install ALL dependencies (including devDependencies needed for build)
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --include=dev

# FROM deps AS builder
# WORKDIR /app
# # Copy node_modules from deps stage
# COPY --from=deps /app/node_modules ./node_modules
# # Copy configuration files
# COPY tsconfig*.json nest-cli.json ./
# # Copy source code
# COPY src ./src

# # Install Nest CLI globally and build
# RUN npm install -g @nestjs/cli && \
#     echo "Node modules contents:" && \
#     ls -la node_modules/@types/ | grep -E "(express|multer)" && \
#     echo "Building project..." && \
#     nest build

# ###################################
# # 3) runner: production runtime   #
# ###################################
# FROM node:20-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# COPY package*.json ./
# RUN npm ci --omit=dev
# COPY --from=builder /app/dist ./dist
# EXPOSE 3001
# CMD ["node", "dist/main.js"]

FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Cache node modules and clean cache
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Limit memory usage during build
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "PORT=3000 HOSTNAME=0.0.0.0 node server.js"]
