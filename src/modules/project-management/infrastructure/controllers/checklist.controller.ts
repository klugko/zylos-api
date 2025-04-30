import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { PrismaChecklistRepository } from '../repositories/prisma-checklist.repository';
import { CreateChecklistDto } from '../../application/dto/create-checklist.dto';
import { CreateChecklistUseCase } from '../../application/use-cases/create-checklist.use-case';


@Controller('api/v1/checklists')
export class ChecklistController {
  constructor(
    private readonly checklistRepo: PrismaChecklistRepository,
    private readonly createChecklist: CreateChecklistUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateChecklistDto) {
    return await this.createChecklist.execute(dto);
  }

  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return await this.checklistRepo.findByProject(projectId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.checklistRepo.findById(id);
    if (!item) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);
    return item;
  }

  @Put(':id/toggle')
  async toggleComplete(@Param('id') id: string) {
    const item = await this.checklistRepo.findById(id);
    if (!item) throw new HttpException('Checklist not found', HttpStatus.NOT_FOUND);
    item.toggle();
    return await this.checklistRepo.update(item);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.checklistRepo.delete(id);
    return { message: 'Deleted successfully' };
  }
}
