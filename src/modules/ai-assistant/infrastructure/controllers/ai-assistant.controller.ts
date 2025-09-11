import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from '@core/common/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';
import { SendMessageDto } from '../../application/dto/chat.dto';
import { SendMessageResponseDto, ConversationListResponseDto, ConversationResponseDto } from '../../application/dto/chat-response.dto';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { GetConversationsUseCase } from '../../application/use-cases/get-conversations.use-case';
import { GetConversationUseCase } from '../../application/use-cases/get-conversation.use-case';
import { UpdateConversationUseCase } from '../../application/use-cases/update-conversation.use-case';
import { DeleteConversationUseCase } from '../../application/use-cases/delete-conversation.use-case';

@ApiTags('AI Assistant')
@Controller('api/v1/ai-assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AiAssistantController {
  constructor(
    private readonly sendMessageUC: SendMessageUseCase,
    private readonly getConversationsUC: GetConversationsUseCase,
    private readonly getConversationUC: GetConversationUseCase,
    private readonly updateConversationUC: UpdateConversationUseCase,
    private readonly deleteConversationUC: DeleteConversationUseCase,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer un message à l\'assistant IA' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Message envoyé et réponse reçue',
    type: SendMessageResponseDto
  })
  @ApiResponse({ status: 400, description: 'Message invalide' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async sendMessage(
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto
  ): Promise<SendMessageResponseDto> {
    return this.sendMessageUC.execute(user.id, dto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Récupérer la liste des conversations de l\'utilisateur' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre de conversations à récupérer (défaut: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Décalage pour la pagination (défaut: 0)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des conversations récupérée',
    type: ConversationListResponseDto
  })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getConversations(
    @CurrentUser() user: User,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ): Promise<ConversationListResponseDto> {
    return this.getConversationsUC.execute(user.id, limit || 20, offset || 0);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Récupérer une conversation spécifique' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation récupérée',
    type: ConversationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string
  ): Promise<ConversationResponseDto> {
    return this.getConversationUC.execute(user.id, conversationId);
  }

  @Put('conversations/:id')
  @ApiOperation({ summary: 'Mettre à jour le titre d\'une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Nouveau titre de conversation' }
      },
      required: ['title']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation mise à jour',
    type: ConversationResponseDto
  })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async updateConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string,
    @Body() dto: { title: string }
  ): Promise<ConversationResponseDto> {
    return this.updateConversationUC.execute(user.id, conversationId, dto);
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une conversation' })
  @ApiParam({ name: 'id', description: 'ID de la conversation' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation supprimée',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Conversation supprimée avec succès' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async deleteConversation(
    @CurrentUser() user: User,
    @Param('id') conversationId: string
  ): Promise<{ message: string }> {
    return this.deleteConversationUC.execute(user.id, conversationId);
  }
}
