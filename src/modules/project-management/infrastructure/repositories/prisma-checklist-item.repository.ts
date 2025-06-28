import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ChecklistItemRepository } from '../../domain/interfaces/checklist-item-repository.interface';
import { ChecklistItem } from '@modules/project-management/domain/entities/checklist-item.entity';

@Injectable()
export class PrismaChecklistItemRepository implements ChecklistItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ChecklistItem | null> {
    const data = await this.prisma.checklistItem.findUnique({ where: { id } });
    if (!data) return null;
    return new ChecklistItem(
      data.id,
      data.title,
      data.isChecked,
      data.taskId,
      data.createdAt,
      data.updatedAt
    );
  }

  async findByTask(taskId: string): Promise<ChecklistItem[]> {
    const list = await this.prisma.checklistItem.findMany({ where: { taskId } });
    return list.map(
      data =>
        new ChecklistItem(
          data.id,
          data.title,
          data.isChecked,
          data.taskId,
          data.createdAt,
          data.updatedAt
        )
    );
  }

  async create(item: ChecklistItem): Promise<ChecklistItem> {
    const data = await this.prisma.checklistItem.create({
      data: {
        id: item.id,
        title: item.title,
        isChecked: item.isChecked,
        taskId: item.taskId,
      },
    });
    return new ChecklistItem(
      data.id,
      data.title,
      data.isChecked,
      data.taskId,
      data.createdAt,
      data.updatedAt
    );
  }

  async update(item: ChecklistItem): Promise<ChecklistItem> {
    const data = await this.prisma.checklistItem.update({
      where: { id: item.id },
      data: {
        title: item.title,
        isChecked: item.isChecked,
      },
    });
    return new ChecklistItem(
      data.id,
      data.title,
      data.isChecked,
      data.taskId,
      data.createdAt,
      data.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklistItem.delete({ where: { id } });
  }
}
