import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetProjectMessagesUseCase } from '../../application/use-cases/get-project-messages.use-case';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';

@ApiTags('Chat Projet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/chat')
export class ProjectChatController {
  constructor(private readonly getMessagesUseCase: GetProjectMessagesUseCase) {}

  @ApiOperation({ summary: 'Récupérer les messages de chat d’un projet' })
  @Get()
  async getMessages(
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.getMessagesUseCase.execute(projectId, user.id, parsedLimit, cursor);
  }
}
