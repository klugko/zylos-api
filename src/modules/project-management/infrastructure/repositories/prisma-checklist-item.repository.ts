import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistItemRepository } from '../../domain/interfaces/checklist-item-repository.interface';

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
      data.checklistId,
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
          data.checklistId,
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
        checklistId: item.checklistId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    });
    return new ChecklistItem(
      data.id,
      data.title,
      data.isChecked,
      data.taskId,
      data.checklistId,
      data.createdAt,
      data.updatedAt
    );
  }

  async bulkCreate(items: ChecklistItem[]): Promise<void> {
    if (!items.length) return;
    await this.prisma.checklistItem.createMany({
      data: items.map((item) => ({
        id: item.id,
        title: item.title,
        isChecked: item.isChecked,
        taskId: item.taskId,
        checklistId: item.checklistId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      skipDuplicates: true,
    });
  }

  async update(item: ChecklistItem): Promise<ChecklistItem> {
    const data = await this.prisma.checklistItem.update({
      where: { id: item.id },
      data: {
        title: item.title,
        isChecked: item.isChecked,
        checklistId: item.checklistId,
      },
    });
    return new ChecklistItem(
      data.id,
      data.title,
      data.isChecked,
      data.taskId,
      data.checklistId,
      data.createdAt,
      data.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklistItem.delete({ where: { id } });
  }
}
