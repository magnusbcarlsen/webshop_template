FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source files
COPY . .

# Build Next.js for production (creates the .next folder)
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
