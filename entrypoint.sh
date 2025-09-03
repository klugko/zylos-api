#!/bin/sh

set -e

cd /usr/src/app

echo "Génération du client Prisma..."
npx prisma generate

echo "Démarrage de l'application..."
exec node dist/main.js