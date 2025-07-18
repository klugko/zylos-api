import { Module } from '@nestjs/common';
import { ProjectManagementModule } from '@modules/project-management/project-management.module'; // <-- ajoute ça
import { PrismaProjectChatMessageRepository } from './infrastructure/repositories/prisma-project-chat-message.repository';
import { PrismaJitsiSessionRepository } from './infrastructure/repositories/prisma-jitsi-session.repository';
import { ProjectChatController } from './infrastructure/controllers/project-chat.controller';
import { JitsiController } from './infrastructure/controllers/jitsi.controller';
import { CreateJitsiSessionUseCase } from './application/use-cases/create-jitsi-session.use-case';
import { GetJitsiSessionUseCase } from './application/use-cases/get-jitsi-session.use-case';
import { CreateChatMessageUseCase } from './application/use-cases/create-chat-message.use-case';
import { GetProjectMessagesUseCase } from './application/use-cases/get-project-messages.use-case';
import { ChatAiAnalysisService } from './application/services/chat-ai-analysis.service';
import { OpenAiChatAnalysisService } from './application/services/openai-chat-analysis.service';
import { AccessControlService } from '@modules/collaboration/application/services/access-control.service';

@Module({
  imports: [
    ProjectManagementModule, 
  ],
  controllers: [ProjectChatController, JitsiController],
  providers: [
    PrismaProjectChatMessageRepository,
    PrismaJitsiSessionRepository,
    { provide: 'IProjectChatMessageRepository', useExisting: PrismaProjectChatMessageRepository },
    { provide: 'IJitsiSessionRepository', useExisting: PrismaJitsiSessionRepository },
    CreateChatMessageUseCase,
    GetProjectMessagesUseCase,
    CreateJitsiSessionUseCase,
    GetJitsiSessionUseCase,
    ChatAiAnalysisService,
    OpenAiChatAnalysisService,
    AccessControlService,
  ],
})
export class CollabChatModule {}
