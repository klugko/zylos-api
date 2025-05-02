import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProjectController } from './infrastructure/controllers/project.controller';
import { TaskController } from './infrastructure/controllers/task.controller';
import { ChecklistController } from './infrastructure/controllers/checklist.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { CreateChecklistUseCase } from './application/use-cases/create-checklist.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.user-case';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';
import { PrismaChecklistRepository } from './infrastructure/repositories/prisma-checklist.repository';
import { GptChecklistService } from './infrastructure/adapters/gpt-checklist.service';
import { ProjectGateway } from './infrastructure/websocket/project.gateway';
import { GetProjectTasksByViewUseCase } from './application/use-cases/get-project-tasks-by-view.use-case';
import { AssignTaskToBestUserUseCase } from './application/use-cases/assign-task.use-case';
import { OpenAIService } from './infrastructure/adapters/openapi.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [AuthModule],
  controllers: [ProjectController, TaskController, ChecklistController],
  
  providers: [
    PrismaService,
    CreateProjectUseCase,
    CreateTaskUseCase,
    CreateChecklistUseCase,
    GptChecklistService,
    PrismaProjectRepository,
    PrismaTaskRepository,
    PrismaChecklistRepository,
    ProjectGateway,
    GetProjectTasksByViewUseCase,
    AssignTaskToBestUserUseCase,
    OpenAIService,

    {
      provide: 'ProjectRepository',
      useClass: PrismaProjectRepository,
    },
    {
      provide: 'TaskRepository',
      useClass: PrismaTaskRepository,
    },
    {
      provide: 'ChecklistRepository',
      useClass: PrismaChecklistRepository,
    }

  ],
  
  exports: ['ProjectRepository', 'TaskRepository', 'ChecklistRepository'],
})
export class ProjectManagementModule {}
