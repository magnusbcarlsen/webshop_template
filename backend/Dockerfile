FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Install all dependencies including dev dependencies for build
RUN npm ci --include=dev && npm cache clean --force

FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig*.json nest-cli.json ./
COPY src ./src

# Set memory limit and install Nest CLI globally
ENV NODE_OPTIONS="--max-old-space-size=512"
RUN npm install -g @nestjs/cli

# Build the application
RUN nest build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
