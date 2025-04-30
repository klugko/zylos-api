import { Controller, Post, Body, Get, Param, Put, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaTaskRepository } from '../repositories/prisma-task.repository';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/create-task.user-case';


@Controller('api/v1/tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly taskRepo: PrismaTaskRepository,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto) {
    return await this.createTaskUseCase.execute(dto);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return await this.taskRepo.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    return task;
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    const task = await this.taskRepo.findById(id);
    if (!task) throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    task.updateStatus(body.status as any);
    return await this.taskRepo.update(task);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.taskRepo.delete(id);
    return { message: 'Deleted successfully' };
  }
}
