import { Controller, Post, Body, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProjectFromTemplateUseCase } from '../../application/use-cases/create-project-from-template.use-case';
import { CreateProjectFromTemplateDto } from '../../application/dto/create-project-from-template.dto';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';


@ApiTags('Project Templates')
@Controller('api/v1/project-templates')
export class ProjectTemplateController {
  constructor(
    private readonly createFromTemplateUseCase: CreateProjectFromTemplateUseCase,
  ) {}

  @Post('create-project')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un projet à partir d’un modèle (template)' })
  @ApiResponse({ status: 201, description: 'Projet créé avec succès' })
  @ApiResponse({ status: 404, description: 'Template introuvable' })
  @ApiBody({ type: CreateProjectFromTemplateDto })
  async createProjectFromTemplate(
    @Body() dto: CreateProjectFromTemplateDto,
  ) {
    try {
      const project = await this.createFromTemplateUseCase.execute(dto);
      return {
        message: 'Projet créé avec succès',
        data: project,
      };
    } catch (err) {
      throw new HttpException(
        err.message ?? 'Erreur lors de la création du projet',
        err.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
