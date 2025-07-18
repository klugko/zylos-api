import { Module } from '@nestjs/common';
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
import { CreateTaskUseCase } from '@modules/project-management/application/use-cases/create-task.use-case';

@Module({
  controllers: [ProjectChatController, JitsiController],
  providers: [
    PrismaProjectChatMessageRepository,
    PrismaJitsiSessionRepository,
    CreateChatMessageUseCase,
    GetProjectMessagesUseCase,
    CreateJitsiSessionUseCase,
    GetJitsiSessionUseCase,
    ChatAiAnalysisService,
    OpenAiChatAnalysisService,
    AccessControlService,
    CreateTaskUseCase,
    { provide: 'IProjectChatMessageRepository', useExisting: PrismaProjectChatMessageRepository },
    { provide: 'IJitsiSessionRepository', useExisting: PrismaJitsiSessionRepository },
  ],
})
export class CollabChatModule {}
