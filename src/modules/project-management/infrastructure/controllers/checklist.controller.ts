import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateChecklistDto } from '../../application/dto/create-checklist.dto';
import { CreateChecklistUseCase } from '../../application/use-cases/create-checklist.use-case';
import { PrismaChecklistRepository } from '../repositories/prisma-checklist.repository';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { Checklist } from '../../domain/entities/checklist.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignChecklistToBestUserUseCase } from '@modules/project-management/application/use-cases/assign-checklist.use-case';
import { UpdateTaskStatusFromChecklistUseCase } from '@modules/project-management/application/use-cases/update-status-task-auto.usecase';

@ApiTags('Checklists')
@Controller('api/v1/checklists')
export class ChecklistController {
  constructor(
    private readonly checklistRepo: PrismaChecklistRepository,
    private readonly createChecklist: CreateChecklistUseCase,
    private readonly assignChecklist: AssignChecklistToBestUserUseCase,
    private readonly updateTaskStatusFromChecklistUseCase: UpdateTaskStatusFromChecklistUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une nouvelle checklist' })
  @ApiBody({ type: CreateChecklistDto })
  @ApiResponse({ status: 201, description: 'Checklist créée' })
  async create(@Body() dto: CreateChecklistDto) {
    return await this.createChecklist.execute(dto);
  }

  

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une checklist par ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: 200, description: 'Checklist trouvée' })
  async findOne(@Param('id') id: string) {
    const checklist = await this.checklistRepo.findById(id);
    if (!checklist) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);
    return checklist;
  }

@Patch(':id/assign/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Assigner automatiquement une checklist via IA' })
@ApiParam({ name: 'id', description: 'ID de la checklist à traiter' })
@ApiResponse({ status: 200, description: 'Checklist assignée automatiquement' })
async assignChecklistByAI(@Param('id') id: string) {
  return await this.assignChecklist.execute(id);
}


  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les checklists d’une tâche' })
  @ApiParam({ name: 'taskId' })
  @ApiResponse({ status: 200, description: 'Checklists retournées' })
  async findByProject(@Param('projectId') projectId: string) {
    const list = await this.checklistRepo.findByProject(projectId); 
    return list;
  }

  @Get('task/:taskId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister toutes les checklists d’une tâche donnée' })
  @ApiParam({ name: 'taskId', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Liste des checklists de la tâche' })
  async findByTask(@Param('taskId') taskId: string) {
    return this.checklistRepo.findByTask(taskId);
  }


  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier les infos d’une checklist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] },
        priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
        assignedUserId: { type: 'string' },
      },
    },
  })
  async update(@Param('id') id: string, @Body() body: Partial<Checklist>) {
    const checklist = await this.checklistRepo.findById(id);
    if (!checklist) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);

    if (body.title) checklist.title = body.title;
    if (body.status) checklist.status = body.status;
    if (body.priority) checklist.priority = body.priority;
    if (body.assignedUserId !== undefined) checklist.assignedUserId = body.assignedUserId;
    
    const updated = await this.checklistRepo.update(checklist);
    await this.updateTaskStatusFromChecklistUseCase.execute(checklist.taskId);
    return updated;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer une checklist' })
  async delete(@Param('id') id: string) {
    await this.checklistRepo.delete(id);
    return { message: 'Checklist supprimée avec succès' };
  }
}
