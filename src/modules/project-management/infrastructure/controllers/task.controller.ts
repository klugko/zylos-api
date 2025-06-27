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
  UseGuards,
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
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { AssignTaskToBestUserUseCase } from '../../application/use-cases/assign-task.use-case';
import { ProjectGateway } from '../websocket/project.gateway';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';


@ApiTags('Tasks')
@Controller('api/v1/tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly taskRepo: PrismaTaskRepository,
    private readonly assignTask: AssignTaskToBestUserUseCase,
    private readonly gateway: ProjectGateway,

  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès' })
  async create(@Body() dto: CreateTaskDto) {
    return await this.createTaskUseCase.execute(dto);
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lister les tâches d’un projet' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Liste des tâches retournée' })
  async findByProject(@Param('projectId') projectId: string) {
    return await this.taskRepo.findByProject(projectId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
    const updatedTask = await this.taskRepo.update(task);

    // événement WebSocket à tous les clients de ce projet
    this.gateway.emitProjectUpdate(updatedTask.projectId, {
      taskId: updatedTask.id,
      status: updatedTask.status,
      updatedAt: new Date(),
    });

    return updatedTask;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
