FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy remaining source code
COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:ts"]
