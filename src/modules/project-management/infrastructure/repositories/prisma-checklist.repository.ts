import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { Checklist } from '../../domain/entities/checklist.entity';

@Injectable()
export class PrismaChecklistRepository implements ChecklistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Checklist | null> {
    const data = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
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
          }
        }
      }
    });
    if (!data) return null;
    return this.toEntity(data);
  }

  async findByProject(projectId: string): Promise<Checklist[]> {
    const data = await this.prisma.checklist.findMany({
      where: { projectId },
      include: {
        assignedTo: {
          select: {
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
          }
        }
      }
    });
    return data.map(this.toEntity);
  }

  async create(checklist: Checklist): Promise<Checklist> {
    const data = await this.prisma.checklist.create({
      data: {
        id: checklist.id,
        title: checklist.title,
        taskId: checklist.taskId,
        projectId: checklist.projectId,
        status: checklist.status,
        priority: checklist.priority,
        assignedUserId: checklist.assignedUserId,
        createdAt: checklist.createdAt,
        updatedAt: checklist.updatedAt,
      },
      include: {
        assignedTo: {
          select: {
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
          }
        }
      }
    });
    return this.toEntity(data);
  }

  async update(checklist: Checklist): Promise<Checklist> {
    const data = await this.prisma.checklist.update({
      where: { id: checklist.id },
      data: {
        title: checklist.title,
        status: checklist.status,
        priority: checklist.priority,
        assignedUserId: checklist.assignedUserId,
        updatedAt: new Date()
      },
      include: {
        assignedTo: {
          select: {
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
          }
        }
      }
    });
    return this.toEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.checklist.delete({ where: { id } });
  }

  async bulkCreate(items: Checklist[]): Promise<void> {
    if (!items.length) return;
    await this.prisma.checklist.createMany({
      data: items.map(c => ({
        id: c.id,
        title: c.title,
        projectId: c.projectId,
        taskId: c.taskId,
        assignedUserId: c.assignedUserId,
        status: c.status,
        priority: c.priority,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      skipDuplicates: true,
    });
  }

  async findByTask(taskId: string): Promise<Checklist[]> {
    const data = await this.prisma.checklist.findMany({ 
      where: { taskId },
      include: {
        assignedTo: {
          select: {
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
          }
        }
      }
    });
    return data.map(this.toEntity);
  }

  private toEntity(data: any): Checklist {
    const checklist = new Checklist(
      data.id,
      data.title,
      data.projectId,
      data.taskId,
      data.createdAt,
      data.updatedAt,
      data.status,
      data.priority,
      data.assignedUserId
    );

    if (data.assignedTo) {
      checklist.assignedUser = data.assignedTo;
    }

    return checklist;
  }
}