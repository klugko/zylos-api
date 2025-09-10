import { Injectable } from "@nestjs/common";
import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { PrismaService } from "src/core/prisma/prisma.service";
import { TaskStatus, TaskPriority } from "../../domain/enums/task.enums";
import { Task } from "../../domain/entities/task.entity";
import { UserRole } from "@modules/auth/domain/enums/user-role.enum";

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly assigneeSelect = {
    id: true,
    fullname: true,
    email: true,
    role: true,
    isActive: true,
    skills: true,
    availability: true,
    performanceScore: true,
    createdAt: true,
    updatedAt: true,
  };

  private toEntity(data: any): Task {
    const task = new Task(
      data.id,
      data.title,
      data.description,
      data.status as TaskStatus,
      (data.priority as TaskPriority) ?? TaskPriority.MEDIUM,
      data.projectId,
      data.createdAt,
      data.updatedAt,
      data.startDate ?? null,
      data.endDate ?? null,
      data.dependencies ?? [],
      data.assignedUserId,
      data.columnId
    );

    if (data.assignee) {
      task.assignee = {
        ...data.assignee,
        role: data.assignee.role as UserRole,
      };
    }

    return task;
  }

  async findById(id: string): Promise<Task | null> {
    const data = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data ? this.toEntity(data) : null;
  }

  async findByProject(projectId: string): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async create(task: Task): Promise<Task> {
    const created = await this.prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority ?? TaskPriority.MEDIUM,
        projectId: task.projectId,
        startDate: task.startDate ?? undefined,
        endDate: task.endDate ?? undefined,
        dependencies: task.dependencies ?? [],
        assignedUserId: task.assignedUserId || undefined,
        columnId: task.columnId,
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return this.toEntity(created);
  }

  async bulkCreate(tasks: Task[]): Promise<void> {
    if (!tasks.length) return;
    await this.prisma.task.createMany({
      data: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectId: t.projectId,
        startDate: t.startDate,
        endDate: t.endDate,
        dependencies: t.dependencies,
        assignedUserId: t.assignedUserId,
        columnId: t.columnId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      skipDuplicates: true,
    });
  }

  async update(task: Task): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority ?? undefined,
        startDate: task.startDate ?? undefined,
        endDate: task.endDate ?? undefined,
        dependencies: task.dependencies,
        assignedUserId: task.assignedUserId || undefined,
        columnId: task.columnId,
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return this.toEntity(updated);
  }

  async updateFull(id: string, data: Partial<Task>): Promise<Task> {
    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        assignedUserId: data.assignedUserId,
        columnId: data.columnId,
        updatedAt: new Date(),
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async exists(taskId: string): Promise<boolean> {
    const count = await this.prisma.task.count({ where: { id: taskId } });
    return count > 0;
  }

  async assignMany(
    pairs: { taskId: string; userId: string }[]
  ): Promise<Task[]> {
    if (!pairs.length) return [];
    const prismaOps = pairs.map(({ taskId, userId }) =>
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          assignedUserId: userId,
          updatedAt: new Date(),
        },
        include: {
          assignee: {
            select: this.assigneeSelect,
          },
        },
      })
    );
    const updated = await this.prisma.$transaction(prismaOps);
    return updated.map(this.toEntity);
  }

  async findByUser(userId: string): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: { assignedUserId: userId },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return data.map(this.toEntity);
  }

  async countByProject(projectId: string): Promise<number> {
    return this.prisma.task.count({ where: { projectId } });
  }

  async countByProjectAndStatus(
    projectId: string,
    status: string
  ): Promise<number> {
    return this.prisma.task.count({
      where: {
        projectId,
        status: status as TaskStatus,
      },
    });
  }

  async findByStatusAndEndDateBefore(
    statuses: TaskStatus[],
    date: Date
  ): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        status: { in: statuses },
        endDate: { lt: date },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findByStatusAndEndDateBetween(
    statuses: TaskStatus[],
    from: Date,
    to: Date
  ): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        status: { in: statuses },
        endDate: { gte: from, lte: to },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findIdleTasksWithoutStartDate(before: Date): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        startDate: null,
        status: TaskStatus.TODO,
        createdAt: { lt: before },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findByUserAndEndDateBefore(
    userId: string,
    before: Date
  ): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: { lt: before },
        status: { not: "DONE" },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findByUserAndEndDateBetween(
    userId: string,
    start: Date,
    end: Date
  ): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: {
          gte: start,
          lte: end,
        },
        status: { not: "DONE" },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findUserIdleTasks(
    userId: string,
    referenceDate: Date
  ): Promise<Task[]> {
    const data = await this.prisma.task.findMany({
      where: {
        assignedUserId: userId,
        endDate: null,
        createdAt: { lt: referenceDate },
        status: {
          in: ["TODO", "IN_PROGRESS"],
        },
      },
      include: {
        assignee: {
          select: this.assigneeSelect,
        },
      },
    });
    return data.map(this.toEntity);
  }

  async findByProjectGroupedByColumns(projectId: string): Promise<any[]> {
    const columns = await this.prisma.taskColumn.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
          include: {
            assignee: {
              select: this.assigneeSelect,
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return columns.map((column) => ({
      id: column.id,
      name: column.name,
      order: column.order,
      projectId: column.projectId,
      tasks: column.tasks.map((task) => this.toEntity(task)),
    }));
  }
}
