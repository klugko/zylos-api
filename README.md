# NexaFlow Project 

Projet pour l'ERP NexaFlow utilisant NestJS avec Clean Architecture

## Architecture

### Structure Clean Architecture
1. **Domain Layer**  
   - Entités métier et règles de gestion  
   - Interfaces de repository/adapters

2. **Application Layer**  
   - Cas d'utilisation (use cases)  
   - DTOs et services métier  
   - Dépend seulement du Domain Layer

3. **Infrastructure Layer**  
   - Implémentations concrètes  
   - Contrôleurs REST  
   - Bases de données, services externes  
   - Dépend des autres couches

### Principes SOLID
- Single Responsibility pour les use cases
- Open/Closed via l'abstraction des repositories
- Dependency Inversion avec injection de dépendances

# Structure des fichiers

```bash
nexa-api/
├── src/
│   ├── core/                       # Code partagé et configurations globales
│   │   ├── common/                 
│   │   │   ├── exceptions/         # Exceptions personnalisées (ex: ValidationException)
│   │   │   ├── filters/            # Filtres Globaux (ex: HttpExceptionFilter)
│   │   │   ├── interceptors/       # Intercepteurs NestJS (ex: LoggingInterceptor)
│   │   │   └── utils/              # Utilitaires communs (helpers, formatters)
│   │   ├── config/                 # Configuration de l'application
│   │   │   └── app-config.ts       # Configuration TypeScript
│   │   └── logging/                # Système de logging centralisé
│   │       └── logger.service.ts   # Service de logging personnalisé
│   │
│   ├── modules/                    # Tous les modules fonctionnels
│   │   └── project-management/     # Module principal
│   │       ├── domain/             # Couche Domain (Clean Architecture)
│   │       │   ├── entities/       # Entités métier
│   │       │   │   └── project.entity.ts       # Entité Project
│   │       │   │   └── task.entity.ts          # Entité Task
│   │       │   ├── interfaces/     # Interfaces de repository/adapters
│   │       │   │   └── project-repository.interface.ts
│   │       │   └── value-objects/  # Objets-valeur métier
│   │       │       └── project-id.vo.ts        # Value Object pour les IDs
│   │       │
│   │       ├── application/        # Couche Application (Use Cases)
│   │       │   ├── dto/            # Data Transfer Objects
│   │       │   │   ├── create-project.dto.ts
│   │       │   │   └── update-project.dto.ts
│   │       │   ├── use-cases/      # Cas d'utilisation
│   │       │   │   ├── create-project.use-case.ts
│   │       │   │   └── assign-task.use-case.ts
│   │       │   └── services/       # Services métier
│   │       │       └── project-validator.service.ts
│   │       │
│   │       └── infrastructure/     # Couche Infrastructure
│   │           ├── controllers/    # Contrôleurs NestJS
│   │           │   └── project.controller.ts
│   │           ├── repositories/   # Implémentations des repositories
│   │           │   └── typeorm-project.repository.ts  # Implémentation TypeORM
│   │           ├── adapters/       # Adaptateurs externes
│   │           │   ├── ...
│   │           │   └── notifications/ # Système de notifications
│   │           └── project-management.module.ts  # Déclaration du module
│   │
│   ├── main.ts                     # Point d'entrée de l'application
│   └── app.module.ts               # Module racine (registre des modules)
│
├── test/                           # Tests automatisés
│   ├── e2e/                        # Tests end-to-end
│   │   └── project.e2e-spec.ts
│   └── unit/                       # Tests unitaires
│       ├── use-cases/
│       └── entities/
│
├── .env.example                    # Template des variables d'environnement
├── package.json                    # Dépendances et scripts
├── tsconfig.json                   # Configuration TypeScript
├── nest-cli.json                   # Configuration NestJS
└── README.md                       # Documentation principale

```

## Extensibilité

Structure modulaire conçue pour l'ajout facile de nouvelles fonctionnalités :

```bash
src/modules/
├── project-management/  # Module existant
└── new-module/          # Nouveau module à créer
    ├── domain/          # Couche métier (entités et interfaces)
    ├── application/     # Cas d'utilisation et services
    └── infrastructure/  # Implémentations techniques
```

## Démarrer le projet

```bash
# Développement
npm run start:dev

# Production
npm run build
npm run start

# Tests
npm run test
npm run test:e2e