import {
    Body,
    Query,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Delete,
    HttpException,
    HttpStatus
  } from '@nestjs/common';
  import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
  import { UpdateProjectDto } from '../../application/dto/update-project.dto';
  import { CreateProjectDto } from '../../application/dto/create-project.dto';
  import { PrismaProjectRepository } from '../repositories/prisma-project.repository';
  import { GetProjectTasksByViewUseCase } from '../../application/use-cases/get-project-tasks-by-view.use-case';

  
  @Controller('api/v1/projects')
  export class ProjectController {
    constructor(
      private readonly createProject: CreateProjectUseCase,
      private readonly projectRepo: PrismaProjectRepository,
      private readonly getTasksByViews: GetProjectTasksByViewUseCase
    ) {}
  
    @Post()
    async create(@Body() dto: CreateProjectDto) {
      return await this.createProject.execute(dto);
    }
  
    @Get()
    async findAll() {
      return await this.projectRepo.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string) {
      const project = await this.projectRepo.findById(id);
      if (!project) {
        throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
      }
      return project;
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
      const project = await this.projectRepo.findById(id);
      if (!project) throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
  
      project.name = dto.name ?? project.name;
      project.description = dto.description ?? project.description;
      project.type = dto.type ?? project.type;
  
      return await this.projectRepo.update(project);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      await this.projectRepo.delete(id);
      return { message: 'Deleted successfully' };
    }
  
    @Put(':id/archive')
    async archive(@Param('id') id: string) {
      return await this.projectRepo.archive(id);
    }

    @Get(':id/tasks')
    async getTasksByView(@Param('id') projectId: string, @Query('view') view: string) {
      const validViews = ['kanban', 'gantt', 'list'];
      const viewType = validViews.includes(view) ? view as 'kanban' | 'gantt' | 'list' : 'list';
      return await this.getTasksByViews.execute(projectId, viewType);
    }
}
  