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
import { SummarizeProjectChatUseCase } from './application/use-cases/summarize-project-chat.usecase';
import { ChatController } from './infrastructure/controllers/chat.controller';
import { OpenAIService } from 'src/shared/ai/openai.service';
import { SummarizeAndSaveMessageUseCase } from './application/use-cases/summarize-and-save-message.usecase';
import { PrismaChatRepository } from './infrastructure/repositories/prisma-chat.repository';

@Module({
  imports: [
    ProjectManagementModule, 
  ],
  controllers: [ProjectChatController, JitsiController, ChatController],
  providers: [
    PrismaProjectChatMessageRepository,
    PrismaJitsiSessionRepository,
    { provide: 'IProjectChatMessageRepository', useExisting: PrismaProjectChatMessageRepository },
    { provide: 'IJitsiSessionRepository', useExisting: PrismaJitsiSessionRepository },
    {provide: 'ChatRepository', useExisting: PrismaProjectChatMessageRepository},
    {
      provide: 'ChatRepository',
      useClass: PrismaChatRepository
    },
    
    CreateChatMessageUseCase,
    GetProjectMessagesUseCase,
    CreateJitsiSessionUseCase,
    GetJitsiSessionUseCase,
    ChatAiAnalysisService,
    OpenAiChatAnalysisService,
    AccessControlService,
    SummarizeProjectChatUseCase,
    OpenAIService,
    SummarizeAndSaveMessageUseCase,
  ],
})
export class CollabChatModule {}
