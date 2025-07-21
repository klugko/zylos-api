import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateJitsiSessionDto } from '../../application/dto/create-jitsi-session.dto';
import { CreateJitsiSessionUseCase } from '../../application/use-cases/create-jitsi-session.use-case';
import { GetJitsiSessionUseCase } from '../../application/use-cases/get-jitsi-session.use-case';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
import { User } from '@modules/auth/domain/entities/user.entity';

@ApiTags('Visio / Jitsi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects/:projectId/visio')
export class JitsiController {
  constructor(
    private readonly createSessionUseCase: CreateJitsiSessionUseCase,
    private readonly getSessionUseCase: GetJitsiSessionUseCase,
  ) {}

  @ApiOperation({ summary: 'Créer ou mettre à jour le lien Jitsi pour un projet' })
  @Post()
  async createSession(
    @Param('projectId') projectId: string,
    @Body() dto: CreateJitsiSessionDto,
    @CurrentUser() user: User,
  ) {
    return this.createSessionUseCase.execute(projectId, user.id, dto);
  }

  @ApiOperation({ summary: 'Obtenir le lien Jitsi actuel d’un projet' })
  @Get()
  async getSession(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.getSessionUseCase.execute(projectId, user.id);
  }
}
