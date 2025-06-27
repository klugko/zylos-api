import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  // UseGuards,
} from '@nestjs/common';
import { PrismaChecklistRepository } from '../repositories/prisma-checklist.repository';
import { CreateChecklistDto } from '../../application/dto/create-checklist.dto';
import { CreateChecklistUseCase } from '../../application/use-cases/create-checklist.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  // ApiBearerAuth,
} from '@nestjs/swagger';
// import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';


@ApiTags('Checklists')
@Controller('api/v1/checklists')
export class ChecklistController {
  constructor(
    private readonly checklistRepo: PrismaChecklistRepository,
    private readonly createChecklist: CreateChecklistUseCase,
  ) {}

  @Post()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une nouvelle checklist' })
  @ApiBody({ type: CreateChecklistDto })
  @ApiResponse({ status: 201, description: 'Checklist créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() dto: CreateChecklistDto) {
    return await this.createChecklist.execute(dto);
  }

  @Get('project/:projectId')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer toutes les checklists liées à un projet' })
  @ApiParam({ name: 'projectId', description: 'ID du projet concerné' })
  @ApiResponse({ status: 200, description: 'Liste des checklists du projet retournée' })
  async findByProject(@Param('projectId') projectId: string) {
    try {
      if (!projectId) {
        throw new HttpException('Project ID is required', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
    return await this.checklistRepo.findByProject(projectId);
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Récupérer une checklist par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la checklist' })
  @ApiResponse({ status: 200, description: 'Checklist trouvée' })
  @ApiResponse({ status: 404, description: 'Checklist non trouvée' })
  async findOne(@Param('id') id: string) {
    const item = await this.checklistRepo.findById(id);
    if (!item) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);
    return item;
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Supprimer une checklist par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la checklist à supprimer' })
  @ApiResponse({ status: 200, description: 'Checklist supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Checklist non trouvée' })
  async delete(@Param('id') id: string) {
    await this.checklistRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  @Put(':id/toggle')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Inverser le statut de complétion de la checklist' })
  @ApiParam({ name: 'id', description: 'ID de la checklist à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Checklist mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Checklist non trouvée' })
  async toggleComplete(@Param('id') id: string) {
    const item = await this.checklistRepo.findById(id);
    if (!item) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);

    item.toggle();
    return await this.checklistRepo.update(item);
  }
}
