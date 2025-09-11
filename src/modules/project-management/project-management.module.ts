import { Module } from "@nestjs/common";
import { PrismaService } from "../../core/prisma/prisma.service";
import { ProjectController } from "./infrastructure/controllers/project.controller";
import { TaskController } from "./infrastructure/controllers/task.controller";
import { ChecklistController } from "./infrastructure/controllers/checklist.controller";
import { CreateProjectUseCase } from "./application/use-cases/create-project.use-case";
import { CreateChecklistUseCase } from "./application/use-cases/create-checklist.use-case";
import { CreateTaskUseCase } from "./application/use-cases/create-task.use-case";
import { DeleteTaskUseCase } from "./application/use-cases/delete-task.use-case";
import { DeleteProjectUseCase } from "./application/use-cases/delete-project.use-case";
import { PrismaProjectRepository } from "./infrastructure/repositories/prisma-project.repository";
import { PrismaTaskRepository } from "./infrastructure/repositories/prisma-task.repository";
import { PrismaChecklistRepository } from "./infrastructure/repositories/prisma-checklist.repository";
import { GptChecklistService } from "./infrastructure/adapters/gpt-checklist.service";
import { ProjectGateway } from "./infrastructure/websocket/project.gateway";
import { GetProjectTasksByViewUseCase } from "./application/use-cases/get-project-tasks-by-view.use-case";
import { AssignTaskToBestUserUseCase } from "./application/use-cases/assign-task.use-case";
import { OpenAIService } from "./infrastructure/adapters/openapi.service";
import { AuthModule } from "../auth/auth.module";
import { ActivityLogModule } from "../activity-log/activity-log.module";
import { UpdateProjectUseCase } from "./application/use-cases/update-project.use-case";
import { GetAllProjectsUseCase } from "./application/use-cases/get-all-projects.use-case";
import { PrismaTaskColumnRepository } from "./infrastructure/repositories/prisma-task-column.repository";
import { TaskColumnController } from "./infrastructure/controllers/task-column.controller";
import { CreateTaskColumnUseCase } from "./application/use-cases/create-task-column.use-case";
import { UpdateTaskColumnUseCase } from "./application/use-cases/update-task-column.use-case";
import { DeleteTaskColumnUseCase } from "./application/use-cases/delete-task-column.use-case";
import { GetTaskColumnsUseCase } from "./application/use-cases/get-task-columns.use-case";
import { ReorderTaskColumnsUseCase } from "./application/use-cases/reorder-task-columns.use-case";
import { InitializeDefaultColumnsUseCase } from "./application/use-cases/initialize-default-columns.use-case";
import { CreateProjectFromTemplateUseCase } from "./application/use-cases/create-project-from-template.use-case";
import { PrismaProjectTemplateRepository } from "./infrastructure/repositories/prisma-project-template.repository";
import { ProjectTemplateController } from "./infrastructure/controllers/project-template.controller.";
import { CreateProjectFromPdfUseCase } from "./application/use-cases/create-project-from-pdf.use-case";
import { GetAllProjectsWithDetailsUseCase } from "./application/use-cases/get-all-projects-with-details.use-case";
import { CreateProjectFromPdfController } from "./infrastructure/controllers/create-project-from-pdf.controller";
import { PrismaChecklistItemRepository } from "./infrastructure/repositories/prisma-checklist-item.repository";
import { ProjectStructureGenerator } from "./infrastructure/adapters/project-generator";
import { CommentController } from "./infrastructure/controllers/comment.controller";
import { CreateCommentUseCase } from "./application/use-cases/create-comment.use-case";
import { PrismaCommentRepository } from "./infrastructure/repositories/prisma-comment.repository";
import { GetProjectProgressUseCase } from "./application/use-cases/get-project-progress.use-case";
import { TrackingGateway } from "./infrastructure/websocket/socket-getway";
import { TrackingService } from "./application/use-cases/tracking-progress";
import { SmartReminderService } from "./application/use-cases/smart-reminder";
import { PrismaReminderNotificationRepository } from "./infrastructure/repositories/prisma-reminder-notification.repository";
import { ReminderController } from "./infrastructure/controllers/reminder.controller";
import { UpdateTaskUseCase } from "./application/use-cases/update-task.use-case";
import { AssignManyTasksUseCase } from "./application/use-cases/assign-many-task.usecase";
import { AssignChecklistToBestUserUseCase } from "./application/use-cases/assign-checklist.use-case";
import { UpdateTaskStatusFromChecklistUseCase } from "./application/use-cases/update-status-task-auto.usecase";
import { FindProjectsByUserUseCase } from "./application/use-cases/find-projects-by-user.use-case";
import { GetProjectMembersUseCase } from "./application/use-cases/get-project-member.usecase";
import { PrismaProjectMemberRepository } from "./infrastructure/repositories/prisma-project-member.repository";
import { AddProjectMembersUseCase } from "./application/use-cases/add-project-members.use-case";
import { AIEstimationService } from "./infrastructure/adapters/openai-estimation.service";
import { CustomStatusController } from "./infrastructure/controllers/custom-status.controller";
import { StatusAlertController } from "./infrastructure/controllers/status-alert.controller";
import { StatusAssignmentController } from "./infrastructure/controllers/status-assignment.controller";
import { CreateCustomStatusUseCase } from "./application/use-cases/create-custom-status.use-case";
import { UpdateCustomStatusUseCase } from "./application/use-cases/update-custom-status.use-case";
import { GetCustomStatusesUseCase } from "./application/use-cases/get-custom-statuses.use-case";
import { AssignCustomStatusUseCase } from "./application/use-cases/assign-custom-status.use-case";
import { StatusMonitoringService } from "./application/services/status-monitoring.service";
import { StatusNotificationService } from "./application/services/status-notification.service";
import { CustomStatusIntegrationService } from "./application/services/custom-status-integration.service";
import { TaskStatusSyncService } from "./application/services/task-status-sync.service";
import { InitializeDefaultStatusesUseCase } from "./application/use-cases/initialize-default-statuses.use-case";
import { TaskStatusSyncController } from "./infrastructure/controllers/task-status-sync.controller";
import { CustomStatusRepository } from "./infrastructure/repositories/custom-status.repository";
import { StatusDurationRepository } from "./infrastructure/repositories/status-duration.repository";
import { StatusAlertRepository } from "./infrastructure/repositories/status-alert.repository";
import { PrismaSimulationRepository } from "./infrastructure/repositories/prisma-simulation.repository";
import { AISimulationService } from "./infrastructure/services/ai-simulation.service";
import { GetSimulationUseCase } from "./application/use-cases/get-simulation.use-case";
import { CreateSimulationUseCase } from "./application/use-cases/create-simulation.use-case";
import { SimulationController } from "./infrastructure/controllers/simulation.controller";

@Module({
  imports: [AuthModule, ActivityLogModule],
  controllers: [
    ProjectController,
    TaskController,
    ChecklistController,
    ProjectTemplateController,
    CreateProjectFromPdfController,
    CommentController,
    ReminderController,
    SimulationController,
    TaskColumnController,
  ],

  providers: [
    PrismaService,
    CreateProjectUseCase,
    UpdateProjectUseCase,
    GetAllProjectsUseCase,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    DeleteProjectUseCase,
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
    UpdateTaskUseCase,
    AssignManyTasksUseCase,
    AssignChecklistToBestUserUseCase,
    UpdateTaskStatusFromChecklistUseCase,
    FindProjectsByUserUseCase,
    GetProjectMembersUseCase,
    AddProjectMembersUseCase,
    CreateCustomStatusUseCase,
    UpdateCustomStatusUseCase,
    GetCustomStatusesUseCase,
    AssignCustomStatusUseCase,
    StatusMonitoringService,
    StatusNotificationService,
    CustomStatusIntegrationService,
    TaskStatusSyncService,
    InitializeDefaultStatusesUseCase,
    CustomStatusRepository,
    StatusDurationRepository,
    StatusAlertRepository,
    CreateSimulationUseCase,
    GetSimulationUseCase,
    AISimulationService,
    PrismaSimulationRepository,
    SimulationController,
    CreateTaskColumnUseCase,
    UpdateTaskColumnUseCase,
    DeleteTaskColumnUseCase,
    GetTaskColumnsUseCase,
    ReorderTaskColumnsUseCase,
    InitializeDefaultColumnsUseCase,
    {
      provide: "ProjectRepository",
      useClass: PrismaProjectRepository,
    },
    {
      provide: "TaskRepository",
      useClass: PrismaTaskRepository,
    },
    {
      provide: "ChecklistRepository",
      useClass: PrismaChecklistRepository,
    },
    {
      provide: "TaskColumnRepository",
      useClass: PrismaTaskColumnRepository,
    },
    {
      provide: "ProjectTemplateRepository",
      useClass: PrismaProjectTemplateRepository,
    },
    {
      provide: "ChecklistItemRepository",
      useClass: PrismaChecklistItemRepository,
    },
    {
      provide: "CommentRepository",
      useClass: PrismaCommentRepository,
    },
    {
      provide: "ReminderNotificationRepository",
      useClass: PrismaReminderNotificationRepository,
    },
    {
      provide: "IProjectMemberRepository",
      useClass: PrismaProjectMemberRepository,
    },
    {
      provide: "IAIEstimationService",
      useClass: AIEstimationService,
    },
    {
      provide: "ICustomStatusRepository",
      useClass: CustomStatusRepository,
    },
    {
      provide: "IStatusDurationRepository",
      useClass: StatusDurationRepository,
    },
    {
      provide: "IStatusAlertRepository",
      useClass: StatusAlertRepository,
    },
    {
      provide: "ISimulationService",
      useClass: AISimulationService,
    },
    {
      provide: "SimulationRepository",
      useClass: PrismaSimulationRepository,
    },
  ],

  exports: [
    "ProjectRepository",
    "TaskRepository",
    "ChecklistRepository",
    CreateTaskUseCase,
  ],
})
export class ProjectManagementModule {}
