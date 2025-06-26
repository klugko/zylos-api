#!/bin/sh

set -e

cd /usr/src/app

# Vérification des variables critiques
required_vars="DATABASE_URL"
for var in $required_vars; do
    if [ -z "$(eval echo \$$var)" ]; then
        echo "❌ Erreur: La variable $var n'est pas définie"
        exit 1
    fi
done

# Fonction pour tester la connexion à la base
test_db_connection() {
    echo "🔌 Test de connexion à la base de données..."
    if npx prisma migrate status > /dev/null 2>&1; then
        echo "✅ Connexion à la base réussie"
        return 0
    else
        echo "❌ Échec de connexion à la base"
        return 1
    fi
}

# Appliquer les migrations
echo "🔄 Application des migrations..."
if test_db_connection; then
    npx prisma migrate deploy
else
    echo "⛔ Impossible d'appliquer les migrations - arrêt"
    exit 1
fi

# Générer le client Prisma
echo "⚙️ Génération du client Prisma..."
npx prisma generate

# Démarrer l'application
echo "🚀 Démarrage de l'application..."
exec node dist/main.js