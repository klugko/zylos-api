# Configuration Google OAuth

## Problème résolu

L'erreur "Missing required parameter: client_id" était causée par des variables d'environnement Google OAuth non configurées.

## Configuration requise

### 1. Variables d'environnement

Les variables suivantes doivent être définies :

```bash
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/redirect
FRONTEND_URL=http://localhost:3001
```

### 2. Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.developers.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ et l'API Google OAuth2
4. Créez des identifiants OAuth 2.0
5. Ajoutez les URLs de redirection autorisées :
   - `http://localhost:3000/api/v1/auth/google/redirect` (développement)
   - `https://votre-domaine.com/api/v1/auth/google/redirect` (production)

### 3. Routes disponibles

- `GET /api/v1/auth/google` - Initie la connexion Google OAuth
- `GET /api/v1/auth/google/redirect` - Callback Google OAuth

### 4. Démarrage

```bash
# Avec Docker
docker-compose up --build

# Ou en développement
npm run start:dev
```

## Architecture

Le système utilise :

- **GoogleStrategy** : Stratégie Passport pour Google OAuth
- **GoogleOAuthValidator** : Validation des variables d'environnement
- **GoogleAuthUseCase** : Logique métier pour l'authentification Google
- **AuthController** : Routes d'authentification

## Validation automatique

Le système valide automatiquement les variables d'environnement au démarrage et affiche une erreur claire si des variables sont manquantes.
