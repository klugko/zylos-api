// test/e2e/project-auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../src/modules/auth/domain/enums/user-role.enum'; // Assurez-vous du chemin correct
import { CreateProjectDto } from '../../src/modules/project-management/application/dto/create-project.dto';
// Importez les enums de Project
import { ProjectClientType, ProjectStatus, ProjectPriority } from '../../src/modules/project-management/domain/enums/project.enums';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../../src/core/prisma/prisma.service'; // Importez PrismaService

describe('Project Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prismaService: PrismaService; // Ajoutez PrismaService

  // Utilisateur de test fictif pour générer le token
  const testUser = {
    id: uuid(),
    email: 'testuser@example.com',
    role: UserRole.USER,
  };

  // Avant tous les tests, initialiser l'application NestJS
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Appliquer le ValidationPipe globalement, comme dans main.ts
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();

    // Récupérer le JwtService et PrismaService de l'instance de l'application
    jwtService = app.get<JwtService>(JwtService);
    prismaService = app.get<PrismaService>(PrismaService);

    // Nettoyer la base de données avant les tests pour garantir l'isolation
    // Ceci est crucial pour les tests d'intégration avec une BDD réelle
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();

    // Créez l'utilisateur de test dans la base de données si nécessaire
    // Cela dépend si votre JwtStrategy ou vos use-cases vérifient l'existence de l'utilisateur
    // Pour cet exemple, nous allons juste créer un utilisateur si le test échoue à cause de son absence.
    // Dans une configuration plus complexe, vous auriez un AuthRepository mocké ou un setup de DB plus élaboré.
    await prismaService.user.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        id: testUser.id,
        email: testUser.email,
        fullname: 'Test User',
        password: 'hashedpassword', // Un mot de passe factice si le champ est non-nullable
        role: testUser.role,
        isActive: true,
      },
    });

    console.log('Test setup complete. App initialized.');
  });

  // Après tous les tests, fermer l'application
  afterAll(async () => {
    // Nettoyer la base de données après les tests
    await prismaService.project.deleteMany();
    await prismaService.user.deleteMany();
    await app.close();
    console.log('Test teardown complete. App closed.');
  });

  describe('GET /api/v1/projects', () => {
    it('devrait retourner 401 (Unauthorized) si aucun token n\'est fourni', () => {
      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .expect(401)
        .expect({ statusCode: 401, message: 'Unauthorized' }); // Vérifiez le corps de l'erreur 401
    });

    it('devrait retourner 200 (OK) si un token valide est fourni', async () => {
      // Générer un token pour l'utilisateur de test
      const accessToken = jwtService.sign(
        { sub: testUser.id, email: testUser.email, role: testUser.role },
        { secret: process.env.JWT_SECRET } // Utilise le SECRET du .env pour la signature
      );

      return request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`) // Définir l'en-tête Authorization
        .expect(200);
    });
  });

  describe('POST /api/v1/projects', () => {
    // Le createProjectDto ci-dessous ne contient pas ownerId, ce qui est correct.
    const createProjectDto: CreateProjectDto = {
      id: uuid(), // L'ID est fourni par le client selon votre DTO
      name: 'Projet Test Authentifié',
      // CORRECTION: Utilisez les membres de l'enum directement
      clientType: ProjectClientType.SIMPLE, 
      description: 'Description du projet de test via l\'API',
      industry: 'Logiciel',
      color: '#FF00FF',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // +30 jours
      budget: 5000.00,
      // CORRECTION: Utilisez les membres de l'enum directement
      status: ProjectStatus.NOT_STARTED,
      // CORRECTION: Utilisez les membres de l'enum directement
      priority: ProjectPriority.HIGH,
      isArchived: false,
      templateId: undefined, // Optionnel
    };

    it('devrait retourner 401 (Unauthorized) si aucun token n\'est fourni pour la création', () => {
      return request(app.getHttpServer())
        .post('/api/v1/projects')
        .send(createProjectDto)
        .expect(401);
    });

    it('devrait retourner 201 (Created) et créer le projet si un token valide est fourni', async () => {
      const accessToken = jwtService.sign(
        { sub: testUser.id, email: testUser.email, role: testUser.role },
        { secret: process.env.JWT_SECRET }
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createProjectDto)
        .expect(201);

      // Vérifier que le projet retourné correspond
      expect(response.body).toHaveProperty('id', createProjectDto.id);
      expect(response.body).toHaveProperty('name', createProjectDto.name);
      expect(response.body).toHaveProperty('ownerId', testUser.id); // L'ownerId doit être celui du user de test

      // Vérifier que le projet existe bien en base de données
      const createdProject = await prismaService.project.findUnique({
        where: { id: createProjectDto.id },
      });
      expect(createdProject).toBeDefined();
      expect(createdProject?.ownerId).toBe(testUser.id);
    });
  });

  // Vous pouvez ajouter des tests pour PUT /api/v1/projects/:id de manière similaire
  // en générant un projet au préalable et en le mettant à jour avec un token.
});
