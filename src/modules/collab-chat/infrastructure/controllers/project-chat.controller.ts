import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProjectMessagesUseCase } from '../../application/use-cases/get-project-messages.use-case';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CreateChatMessageProjectUseCase } from '@modules/collab-chat/application/use-cases/create-chat-message.usecase';
import { CreateChatMessageDto } from '@modules/collab-chat/application/dto/create-chat-message.dto';

@ApiTags('Chat Projet')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('api/v1/projects/:projectId/chat')
export class ProjectChatController {
  constructor(
    private readonly getMessagesUseCase: GetProjectMessagesUseCase,
    private readonly createChatMessageUseCase: CreateChatMessageProjectUseCase
    
  ) {}

 
  @Get()
  @ApiOperation({ summary: 'Récupérer les messages d’un projet' })
  async getMessages(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedPage = page ? parseInt(page, 10) : 1;
    return this.getMessagesUseCase.execute(projectId, user.id, parsedLimit, parsedPage);
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Envoyer un message dans un projet', description: 'Permet à un utilisateur authentifié d’envoyer un message texte dans le chat d’un projet.' })
  @ApiBody({ type: CreateChatMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message envoyé avec succès',
    schema: {
      example: {
        id: 'uuid',
        projectId: 'd7981fd3-82ff-45a7-8ec1-2e92aee92c2e',
        senderId: 'uuid_user',
        content: 'Ok pour valider la maquette.',
        createdAt: '2025-08-02T18:00:00.000Z',
      },
    },
  })
  async sendMessage(
    @CurrentUser() user: User,
    @Body() dto: CreateChatMessageDto,
  ) {
    const message = await this.createChatMessageUseCase.execute(user.id, dto.projectId, dto.content);
    return message;
  }
}
