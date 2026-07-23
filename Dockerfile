FROM node:20-alpine

WORKDIR /app

# Copie et installation des dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev || npm install

# Copie de tout le code source
COPY . .

# Port par défaut
ENV PORT=3000
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server/index.js"]
