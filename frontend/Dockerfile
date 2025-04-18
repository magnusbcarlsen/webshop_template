FROM node:18-alpine

WORKDIR /app

# only copy package manifest & install
COPY package*.json ./
RUN npm ci

ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKEIDAR_USEPOLLING=true

# bind‑mount will supply the rest of your code
EXPOSE 3000

# start in dev mode (fast‑refresh/HMR)
CMD ["npm", "run", "dev"]

# FROM node:18-alpine

# WORKDIR /app

# # Copy package files and install dependencies
# COPY package*.json ./
# RUN npm install

# # Copy the rest of the source files
# COPY . .

# # Build Next.js for production (creates the .next folder)
# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "start"]

