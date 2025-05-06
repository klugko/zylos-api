import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.user-case';
import { AssignTaskToBestUserUseCase } from '../../application/use-cases/assign-task.use-case';


@ApiTags('Tasks')
@Controller('api/v1/tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly taskRepo: PrismaTaskRepository,
    private readonly assignTask: AssignTaskToBestUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès' })
  async create(@Body() dto: CreateTaskDto) {
    return await this.createTaskUseCase.execute(dto);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Lister les tâches d’un projet' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Liste des tâches retournée' })
  async findByProject(@Param('projectId') projectId: string) {
    return await this.taskRepo.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une tâche par ID' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche trouvée' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  async findOne(@Param('id') id: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    return task;
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Changer le statut d’une tâche' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiBody({
    schema: {
      example: {
        status: 'IN_PROGRESS',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    task.updateStatus(body.status as any);
    return await this.taskRepo.update(task);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche supprimée' })
  async remove(@Param('id') id: string) {
    await this.taskRepo.delete(id);
    return { message: 'Deleted successfully' };
  }

  @Post(':id/assign-task-ai')
  @ApiOperation({ summary: 'Assigner une tâche automatiquement par IA' })
  @ApiParam({ name: 'id', description: 'ID de la tâche à assigner' })
  @ApiResponse({ status: 200, description: 'Tâche assignée automatiquement' })
  async assign(@Param('id') id: string) {
    return await this.assignTask.execute(id);
  }
}
