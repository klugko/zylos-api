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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.use-case';
import { AssignTaskToBestUserUseCase } from '../../application/use-cases/assign-task.use-case';
import { ProjectGateway } from '../websocket/project.gateway';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
import { UpdateTaskUseCase } from '@modules/project-management/application/use-cases/update-task.use-case';
import { UpdateTaskDto } from '@modules/project-management/application/dto/update-task.dto';
import { TaskPriority, TaskStatus } from '@modules/project-management/domain/enums/task.enums';
import { BulkAssignTasksDto } from '@modules/project-management/application/dto/assign-many-task.dto';
import { AssignManyTasksUseCase } from '@modules/project-management/application/use-cases/assign-many-task.usecase';


@ApiTags('Tasks')
@Controller('api/v1/tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly taskRepo: PrismaTaskRepository,
    private readonly assignTask: AssignTaskToBestUserUseCase,
    private readonly gateway: ProjectGateway,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly assignManyUseCase: AssignManyTasksUseCase,

  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Créer une tâche' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès' })
  async create(@Body() dto: CreateTaskDto) {
    return await this.createTaskUseCase.execute(dto);
  }


  @Get('enums')
  @ApiOperation({ summary: 'Lister les valeurs autorisées des énumérations Task' })
  @ApiResponse({
    status: 200,
    description: 'Tableau des statuts et priorités disponibles',
    schema: {
      example: {
        statuses:   ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'],
        priorities: ['LOW',  'MEDIUM',      'HIGH', 'URGENT'],
      },
    },
  })
  getEnums() {
    return {
      statuses:   Object.values(TaskStatus),
      priorities: Object.values(TaskPriority),
    };
  }

  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les tâches d’un projet' })
  @ApiParam({ name: 'projectId', description: 'ID du projet' })
  @ApiResponse({ status: 200, description: 'Liste des tâches retournée' })
  async findByProject(@Param('projectId') projectId: string) {
    return await this.taskRepo.findByProject(projectId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer une tâche par ID' })
  @ApiParam({ name: 'id', description: 'ID de la tâche' })
  @ApiResponse({ status: 200, description: 'Tâche trouvée' })
  @ApiResponse({ status: 404, description: 'Tâche non trouvée' })
  async findOne(@Param('id') id: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    return task;
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mettre à jour une tâche (titre, dates, statut, etc.)' })
  @ApiParam({ name: 'id', description: 'Identifiant unique de la tâche' })
  @ApiBody({
    description: 'Champs modifiables : titre, description, dates, statut, priorité, assignation, colonne.',
    type: UpdateTaskDto,
  })
  @ApiResponse({ status: 200, description: 'Tâche mise à jour' })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.updateTaskUseCase.execute(id, dto);
  }


  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
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
  @ApiBearerAuth('JWT-auth')
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

  @Post('assign-tasks-ai')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assigner automatiquement plusieurs tâches par IA' })
  @ApiBody({ type: BulkAssignTasksDto })
  @ApiResponse({
    status: 200,
    description: 'Liste des tâches mises à jour',
    schema: {
      example: [
        {
          "tasks": [
            {
              "id": "task_101",
              "title": "Créer landing page produit",
              "description": "Concevoir la page d'accueil du nouveau produit."
            },
            {
              "id": "task_102",
              "title": "Mettre à jour documentation API",
              "description": "Ajouter les endpoints v2 et des exemples cURL."
            },
            {
              "id": "task_103",
              "title": "Tests end-to-end",
              "description": "Écrire des tests Cypress pour le flux d'inscription."
            }
          ]
        }        
      ],
    },
  })
  async bulkAssign(@Body() dto: BulkAssignTasksDto) {
    return this.assignManyUseCase.execute(dto.tasks);
  }

@Get('user/:userId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Lister les tâches assignées à un utilisateur' })
@ApiParam({ name: 'userId', description: 'ID de l’utilisateur' })
@ApiResponse({ status: 200, description: 'Liste des tâches assignées retournée' })
async findByUser(@Param('userId') userId: string) {
  return await this.taskRepo.findByUser(userId);
}

}
