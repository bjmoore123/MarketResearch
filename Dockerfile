FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json .
RUN npm install --omit=dev

# Copy server and static files
COPY server.js .
COPY public/ ./public/

EXPOSE 3000

CMD ["node", "server.js"]
