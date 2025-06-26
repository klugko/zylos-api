# Étape de construction
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copier les fichiers nécessaires pour les dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer les dépendances et outils de construction
RUN apk add --no-cache python3 make g++ openssl && \
    npm ci && \
    npx prisma generate

# Copier le reste du code
COPY . .

# Construire l'application
RUN npm run build

# Étape d'exécution finale
FROM node:18-alpine

WORKDIR /usr/src/app

# Installer les dépendances nécessaires
RUN apk add --no-cache openssl

# Copier depuis l'étape de construction
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Copier le script d'entrée
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


EXPOSE ${PORT}

ENTRYPOINT ["/entrypoint.sh"]