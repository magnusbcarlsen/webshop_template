# --------------- Stage 1: Build the application ---------------
    FROM node:18-alpine AS builder

    # Create and switch to the app directory
    WORKDIR /app
    
    # Copy package manifests and install dependencies
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # Copy the rest of the code
    COPY . .
    
    # Build the application (Next.js, CRA, Vite, etc.)
    RUN npm run build
    
    # --------------- Stage 2: Production container ---------------
    FROM node:18-alpine AS runner
    
    WORKDIR /app
    
    # Copy only the necessary artifacts from builder
    COPY --from=builder /app/package.json /app/package-lock.json ./
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.next ./.next
    # ^ For Next.js specifically; adapt if using CRA/Vite.
    
    # Use production environment by default
    ENV NODE_ENV=production
    
    # Expose the port (Next.js defaults to 3000)
    EXPOSE 3000
    
    # Run the production server
    CMD ["npm", "start"]