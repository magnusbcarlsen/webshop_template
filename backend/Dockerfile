FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies needed for build)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

FROM deps AS builder
WORKDIR /app
# Copy node_modules from deps stage
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
# 3) runner: production runtime   #
###################################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]

