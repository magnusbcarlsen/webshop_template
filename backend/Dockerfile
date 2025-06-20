FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all dependencies including dev dependencies for build
RUN npm ci --include=dev && npm cache clean --force

FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Set memory limit and enable webcrypto
ENV NODE_OPTIONS="--max-old-space-size=512 --experimental-global-webcrypto"
RUN npm install -g @nestjs/cli

# Build the application
RUN nest build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512 --experimental-global-webcrypto"

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]