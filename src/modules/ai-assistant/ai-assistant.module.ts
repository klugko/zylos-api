import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { CoreModule } from '../../core/core.module';
import { AiAssistantController } from './infrastructure/controllers/ai-assistant.controller';
import { PrismaAiConversationRepository } from './infrastructure/repositories/prisma-ai-conversation.repository';
import { AiAssistantService } from './application/services/ai-assistant.service';
import { SendMessageUseCase } from './application/use-cases/send-message.use-case';
import { GetConversationsUseCase } from './application/use-cases/get-conversations.use-case';
import { GetConversationUseCase } from './application/use-cases/get-conversation.use-case';
import { UpdateConversationUseCase } from './application/use-cases/update-conversation.use-case';
import { DeleteConversationUseCase } from './application/use-cases/delete-conversation.use-case';
import { GeneratePdfUseCase } from './application/use-cases/generate-pdf.use-case';
import { PdfGeneratorService } from './infrastructure/services/pdf-generator.service';
import { OpenAIService } from '../../shared/ai/openai.service';

@Module({
  imports: [
    CoreModule,
    PrismaModule,
  ],
  controllers: [
    AiAssistantController,
  ],
  providers: [
    AiAssistantService,
    SendMessageUseCase,
    GetConversationsUseCase,
    GetConversationUseCase,
    UpdateConversationUseCase,
    DeleteConversationUseCase,
    GeneratePdfUseCase,
    PdfGeneratorService,
    OpenAIService,
    {
      provide: 'AiConversationRepository',
      useClass: PrismaAiConversationRepository,
    },
  ],
  exports: [
    AiAssistantService,
    SendMessageUseCase,
    GetConversationsUseCase,
    GetConversationUseCase,
    UpdateConversationUseCase,
    DeleteConversationUseCase,
    GeneratePdfUseCase,
    PdfGeneratorService,
    'AiConversationRepository',
  ],
})
export class AiAssistantModule {}
