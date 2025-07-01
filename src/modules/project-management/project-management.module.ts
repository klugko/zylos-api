import { Module } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProjectController } from './infrastructure/controllers/project.controller';
import { TaskController } from './infrastructure/controllers/task.controller';
import { ChecklistController } from './infrastructure/controllers/checklist.controller';
import { CreateProjectUseCase } from './application/use-cases/create-project.use-case';
import { CreateChecklistUseCase } from './application/use-cases/create-checklist.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { PrismaProjectRepository } from './infrastructure/repositories/prisma-project.repository';
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';
import { PrismaChecklistRepository } from './infrastructure/repositories/prisma-checklist.repository';
import { GptChecklistService } from './infrastructure/adapters/gpt-checklist.service';
import { ProjectGateway } from './infrastructure/websocket/project.gateway';
import { GetProjectTasksByViewUseCase } from './application/use-cases/get-project-tasks-by-view.use-case';
import { AssignTaskToBestUserUseCase } from './application/use-cases/assign-task.use-case';
import { OpenAIService } from './infrastructure/adapters/openapi.service';
import { AuthModule } from '../auth/auth.module';
import { UpdateProjectUseCase } from './application/use-cases/update-project.use-case';
import { GetAllProjectsUseCase } from './application/use-cases/get-all-projects.use-case';
import { PrismaTaskColumnRepository } from './infrastructure/repositories/prisma-task-column.repository';
import { CreateProjectFromTemplateUseCase } from './application/use-cases/create-project-from-template.use-case';
import { PrismaProjectTemplateRepository } from './infrastructure/repositories/prisma-project-template.repository';
import { ProjectTemplateController } from './infrastructure/controllers/project-template.controller.';
import { CreateProjectFromPdfUseCase } from './application/use-cases/create-project-from-pdf.use-case';
import { GetAllProjectsWithDetailsUseCase } from './application/use-cases/get-all-projects-with-details.use-case';
import { CreateProjectFromPdfController } from './infrastructure/controllers/create-project-from-pdf.controller';
import { PrismaChecklistItemRepository } from './infrastructure/repositories/prisma-checklist-item.repository';
import { ProjectStructureGenerator } from './infrastructure/adapters/project-generator';
import { CommentController } from './infrastructure/controllers/comment.controller';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { PrismaCommentRepository } from './infrastructure/repositories/prisma-comment.repository';
import { GetProjectProgressUseCase } from './application/use-cases/get-project-progress.use-case';
import { TrackingGateway } from './infrastructure/websocket/socket-getway';
import { TrackingService } from './application/use-cases/tracking-progress';
import { SmartReminderService } from './application/use-cases/smart-reminder';
import { PrismaReminderNotificationRepository } from './infrastructure/repositories/prisma-reminder-notification.repository';
import { ReminderController } from './infrastructure/controllers/reminder.controller';

@Module({
  imports: [AuthModule],
  controllers: [ProjectController, 
                                  TaskController, 
                                  ChecklistController, 
                                  ProjectTemplateController,
                                  CreateProjectFromPdfController,
                                  CommentController,
                                ReminderController],
  
  providers: [
    PrismaService,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    GetAllProjectsUseCase,
    CreateTaskUseCase,
    CreateChecklistUseCase,
    GptChecklistService,
    PrismaProjectRepository,
    PrismaTaskRepository,
    PrismaChecklistRepository,
    ProjectGateway,
    GetProjectTasksByViewUseCase,
    AssignTaskToBestUserUseCase,
    CreateProjectFromTemplateUseCase,
    OpenAIService,
    CreateProjectFromPdfUseCase,
    GetAllProjectsWithDetailsUseCase,
    ProjectStructureGenerator,
    CreateCommentUseCase,
    PrismaCommentRepository,
    GetProjectProgressUseCase,
    TrackingGateway,
    TrackingService,
    SmartReminderService,
    PrismaReminderNotificationRepository,
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
    },
    {
      provide: 'TaskColumnRepository',
      useClass: PrismaTaskColumnRepository,
    },
    {
      provide: 'ProjectTemplateRepository',
      useClass: PrismaProjectTemplateRepository
    },
    {
      provide: 'ChecklistItemRepository',
      useClass: PrismaChecklistItemRepository,
    },
    {
      provide: 'CommentRepository',
      useClass: PrismaCommentRepository,
    },
    {
      provide: 'ReminderNotificationRepository',
      useClass: PrismaReminderNotificationRepository,
    },
  ],
  
  exports: ['ProjectRepository', 'TaskRepository', 'ChecklistRepository'],
})
export class ProjectManagementModule {}
