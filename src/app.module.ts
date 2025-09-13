import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./core/prisma/prisma.module";
import { ProjectManagementModule } from "./modules/project-management/project-management.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RagModule } from "./rag/rag.module";
import { DocumentModule } from "@modules/document-management/document.module";
import { CollaborationModule } from "@modules/collaboration/collaboration.module";
import { HealthCheckController } from "./health-check.controller";
import { CollabChatModule } from "@modules/collab-chat/collab-chat.module";
import { SurveyModule } from "@modules/survey/survey.module";
import { ActivityLogModule } from "@modules/activity-log/activity-log.module";
import { AiAssistantModule } from "@modules/ai-assistant/ai-assistant.module";
import { CoreModule } from "@core/core.module";
import configuration from "./core/config/configuration";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ".env",
    }),
    CoreModule,
    PrismaModule,
    AuthModule,
    ProjectManagementModule,
    RagModule,
    DocumentModule,
    CollaborationModule,
    CollabChatModule,
    SurveyModule,
    ActivityLogModule,
    AiAssistantModule,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
