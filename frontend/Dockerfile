# ######### 1: deps stage #########
# FROM node:18-alpine AS deps
# WORKDIR /app
# COPY package*.json ./
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci

# ######### 2: build stage #########
# FROM deps AS builder
# WORKDIR /app
# COPY . .
# RUN npm run build

# ######### 3: runner stage #########
# FROM node:18-alpine AS runner
# WORKDIR /app
# ENV NODE_ENV=production
# # only prod deps
# COPY package*.json ./
# RUN npm ci --omit=dev
# # copy next build outputs
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./next.config.js
# EXPOSE 3000
# CMD ["npm", "run", "start"]


FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install production dependencies first
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# Install dev dependencies in a separate layer
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

FROM deps AS builder
WORKDIR /app
# Copy all node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy configuration files
COPY tsconfig*.json nest-cli.json ./
# Copy source code
COPY src ./src

# Install Nest CLI globally and build
RUN npm install -g @nestjs/cli && \
    echo "Node modules contents:" && \
    ls -la node_modules/@types/ | grep -E "(express|multer)" && \
    echo "Building project..." && \
    nest build

###################################
# 3) Create a clean prod deps stage #
###################################
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

###################################
# 4) runner: production runtime   #
###################################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package*.json ./

COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]