# AuraNote v2 — image unique : install workspaces, build du web (Vite), run serveur (tsx)
FROM node:20-alpine
WORKDIR /app

# Dépendances (tous les workspaces ; tsx sert à exécuter le serveur TS en prod)
COPY package*.json ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN npm install

# Code source + build du front
COPY . .
RUN npm run build:web

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npx", "tsx", "apps/server/src/index.ts"]
