import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/prisma/prisma.service";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";
import { UpdateTaskColumnDto } from "../../application/dto/update-task-column.dto";
import { TaskColumn } from "../../domain/entities/task-column.entity";

@Injectable()
export class PrismaTaskColumnRepository implements TaskColumnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProjectId(projectId: string): Promise<TaskColumn[]> {
    const columns = await this.prisma.taskColumn.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    return columns.map(
      (col) => new TaskColumn(col.id, col.name, col.order, col.projectId)
    );
  }

  async create(column: TaskColumn): Promise<TaskColumn> {
    const created = await this.prisma.taskColumn.create({
      data: {
        id: column.id,
        name: column.name,
        order: column.order,
        projectId: column.projectId,
      },
    });

    return new TaskColumn(
      created.id,
      created.name,
      created.order,
      created.projectId
    );
  }

  async update(id: string, dto: UpdateTaskColumnDto): Promise<TaskColumn> {
    const existing = await this.prisma.taskColumn.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Colonne ${id} non trouvée.`);

    const updated = await this.prisma.taskColumn.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        order: dto.order ?? existing.order,
        projectId: dto.projectId ?? existing.projectId,
      },
    });

    return new TaskColumn(
      updated.id,
      updated.name,
      updated.order,
      updated.projectId
    );
  }

  async updateOrder(id: string, order: number): Promise<TaskColumn> {
    const updated = await this.prisma.taskColumn.update({
      where: { id },
      data: { order },
    });

    return new TaskColumn(
      updated.id,
      updated.name,
      updated.order,
      updated.projectId
    );
  }

  async findById(id: string): Promise<TaskColumn | null> {
    const column = await this.prisma.taskColumn.findUnique({
      where: { id },
    });

    if (!column) return null;

    return new TaskColumn(
      column.id,
      column.name,
      column.order,
      column.projectId
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.taskColumn.delete({
      where: { id },
    });
  }

  async hasTasks(id: string): Promise<boolean> {
    const taskCount = await this.prisma.task.count({
      where: { columnId: id },
    });

    return taskCount > 0;
  }
}
