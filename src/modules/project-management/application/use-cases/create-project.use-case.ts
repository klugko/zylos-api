
// import { Inject, Injectable } from '@nestjs/common';
// import { v4 as uuidv4 } from 'uuid';
// import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
// import { CreateProjectDto } from '../dto/create-project.dto';
// import { Project } from '../../domain/entities/project.entity';
// import { TaskRepository } from '@modules/project-management/domain/interfaces/task-repository.interface';
// import { ChecklistRepository } from '@modules/project-management/domain/interfaces/checklist-repository.interface';
// import { PrismaService } from '@core/prisma/prisma.service';
// import { ProjectStructureGenerator } from '@modules/project-management/infrastructure/adapters/project-generator';


// @Injectable()
// export class CreateProjectUseCase {
//   constructor(
//     @Inject('ProjectRepository') private readonly projectRepository: ProjectRepository,
//     @Inject('TaskRepository') private readonly taskRepository: TaskRepository,
//     @Inject('ChecklistRepository') private readonly checklistRepository: ChecklistRepository,
//     private readonly generator: ProjectStructureGenerator,
//     private readonly prisma: PrismaService, // pour la transaction
//   ) {}

//   async execute(dto: CreateProjectDto): Promise<Project> {
//     const project = new Project(
//       dto.id ?? uuidv4(),
//       dto.name,
//       dto.description ?? null,
//       dto.clientType,
//       dto.industry ?? null,
//       dto.color ?? null,
//       dto.startDate ? new Date(dto.startDate) : null,
//       dto.endDate ? new Date(dto.endDate) : null,
//       dto.budget ?? null,
//       0,
//       dto.status ?? 'NOT_STARTED',
//       dto.priority ?? 'MEDIUM',
//       dto.isArchived ?? false,
//       new Date(),
//       new Date(),
//       dto.ownerId ?? null,
//       dto.templateId ?? null,
//     );

//     // --- Transaction ---------------------------------------------------------------------------------
//     await this.prisma.$transaction(async (tx) => {
//       // 1. projet
//       await this.projectRepository.create(project);

//       // 2. IA
//       if (dto.aiGenerateStructure !== false) {
//         const { tasks, checklists } = await this.generator.generate({
//           id: project.id,
//           name: project.name,
//           description: project.description ?? '',
//         });

//         await this.taskRepository.bulkCreate(tasks);
//         await this.checklistRepository.bulkCreate(checklists);
//       }
//     });
//     // --------------------------------------------------------------------------------------------------

//     return project;
//   }
// }


import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { v4 as uuid } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '../../domain/entities/project.entity';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { ProjectStructureGenerator } from '../../infrastructure/adapters/project-generator';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '@modules/project-management/domain/enums/project.enums';

@Injectable()
export class CreateProjectUseCase {
  private readonly logger = new Logger(CreateProjectUseCase.name);

  constructor(
    @Inject('ProjectRepository') private readonly projectRepository: ProjectRepository,
    @Inject('TaskRepository') private readonly taskRepository: TaskRepository,
    @Inject('ChecklistRepository') private readonly checklistRepository: ChecklistRepository,
    private readonly generator: ProjectStructureGenerator,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    const now = new Date();
    const projectId = dto.id ?? uuid(); // 🆕 Génération UUID serveur
    const project = new Project(
      projectId,
      dto.name,
      dto.description ?? null,
      dto.clientType,
      dto.industry ?? null,
      dto.color ?? null,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.endDate ? new Date(dto.endDate) : null,
      dto.budget ?? null,
      0,
      dto.status ?? 'NOT_STARTED',
      dto.priority ?? 'MEDIUM',
      dto.isArchived ?? false,
      now,
      now,
      dto.ownerId ?? null,
      dto.templateId ?? null,
    );

    try {
      // ① Appel GPT (HORS TRANSACTION)
      let tasks = [];
      let checklists = [];
      if (dto.aiGenerateStructure !== false) {
        const result = await this.generator.generate({
          id: projectId,
          name: dto.name,
          description: dto.description ?? '',
        });
        tasks = result.tasks;
        checklists = result.checklists;
      }

      // ② Transaction rapide avec batch inserts
      await this.prisma.$transaction([
        this.prisma.project.create({
          data: {
            id: project.id,
            name: project.name,
            description: project.description,
            clientType: project.clientType  as ProjectClientType,
            industry: project.industry,
            color: project.color,
            startDate: project.startDate,
            endDate: project.endDate,
            budget: project.budget,
            progress: project.progress,
            status: project.status as ProjectStatus,
            priority: project.priority as ProjectPriority,
            isArchived: project.isArchived,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            ownerId: project.ownerId,
            templateId: project.templateId,
          },
        }),
        ...(tasks.length > 0
          ? [this.prisma.task.createMany({ data: tasks, skipDuplicates: true })]
          : []),
        ...(checklists.length > 0
          ? [this.prisma.checklist.createMany({ data: checklists, skipDuplicates: true })]
          : []),
      ]);

      return project;
    } catch (err) {
      // ③ Gestion des erreurs UUID déjà utilisé
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        this.logger.warn(`❗ Conflit UUID – retry avec nouveau ID`);
        return this.execute({ ...dto, id: uuid() });
      }

      this.logger.error('❌ Erreur lors de la création du projet', err);
      throw err;
    }
  }
}
