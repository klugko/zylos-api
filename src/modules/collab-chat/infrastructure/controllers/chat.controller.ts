import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { SummarizeChatDto } from '@modules/collab-chat/application/dto/summarize-chat.dto';
import { SummarizeAndSaveMessageUseCase } from '@modules/collab-chat/application/use-cases/summarize-and-save-message.usecase';
import {
    Controller,
    Post,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';


  
  @ApiTags('Chat')
  @Controller('api/v1/chat')
  export class ChatController {
    constructor(
      private readonly summarizeUseCase: SummarizeAndSaveMessageUseCase,
    ) {}
  
    @Post('summary')
    @ApiOperation({
      summary: 'Génère un résumé IA d’un message long (ex: visio) et le sauvegarde dans le chat',
      description: 'Ce résumé est généré avec OpenAI et enregistré comme message de type résumé.',
    })
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiBody({ type: SummarizeChatDto })
    @ApiResponse({
      status: 201,
      description: 'Résumé généré et enregistré',
      schema: {
        example: {
          id: 'uuid',
          projectId: '10000000-0000-0000-0000-000000000001',
          senderId: 'uuid_user',
          content: "Résumé : Rija fera le frontend. Le wireframe est validé...",
          createdAt: '2025-08-02T15:00:00.000Z',
          sender: {
            id: 'uuid_user',
            fullname: 'Jean Aimé',
          },
          project: {
            id: '10000000-0000-0000-0000-000000000001',
            name: 'Projet de refonte web',
          },
        },
      },
    })
    async summarizeAndSave(
      @CurrentUser() user: User,
      @Body() dto: SummarizeChatDto,
    ) {
      const message = await this.summarizeUseCase.execute(
        user.id,
        dto.projectId,
        dto.messageContent,
      );
      return message;
    }

  }
  