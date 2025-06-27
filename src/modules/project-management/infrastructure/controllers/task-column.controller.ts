import { Controller, Get, Post, Put, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateTaskColumnUseCase } from '../../application/use-cases/create-task-column.use-case';
import { GetTaskColumnsUseCase } from '../../application/use-cases/get-task-columns.use-case';
import { UpdateTaskColumnUseCase } from '../../application/use-cases/update-task-column.use-case';
import { UpdateTaskColumnOrderUseCase } from '../../application/use-cases/update-task-column-order.use-case';
import { CreateTaskColumnDto } from '../../application/dto/create-task-column.dto';
import { UpdateTaskColumnDto } from '../../application/dto/update-task-column.dto';
import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';

@ApiTags('TaskColumns')
@Controller('columns')
export class TaskColumnController {
  constructor(
    private readonly getColumns: GetTaskColumnsUseCase,
    private readonly createColumn: CreateTaskColumnUseCase,
    private readonly updateColumn: UpdateTaskColumnUseCase,
    private readonly updateOrder: UpdateTaskColumnOrderUseCase,
  ) {}

  @Get(':projectId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Liste des colonnes pour un projet donné' })
  async getColumnsByProject(@Param('projectId') projectId: string) {
    return this.getColumns.execute(projectId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Créer une colonne' })
  async create(@Body() dto: CreateTaskColumnDto) {
    return this.createColumn.execute(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Modifier une colonne' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskColumnDto) {
    return this.updateColumn.execute(id, dto);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mettre à jour l\'ordre d\'une colonne' })
  async updateOrderColumn(@Param('id') id: string, @Body() body: { order: number }) {
    return this.updateOrder.execute(id, body.order);
  }
}
