# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy server source
COPY server/ ./server/

# Expose backend port
EXPOSE 3001

CMD ["node", "server/index.js"]
