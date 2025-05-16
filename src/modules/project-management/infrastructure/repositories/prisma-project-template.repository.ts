import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ProjectTemplateRepository } from '../../domain/interfaces/project-template.repository.interface';
import { ProjectTemplate } from '../../domain/entities/project-template.entity';
import { TaskTemplate } from '../../domain/entities/task-template.entity';
import { ChecklistTemplate } from '../../domain/entities/checklist-template.entity';


@Injectable()
export class PrismaProjectTemplateRepository implements ProjectTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByIdWithTasks(templateId: string): Promise<ProjectTemplate | null> {
    const template = await this.prisma.projectTemplate.findUnique({
      where: { id: templateId },
      include: {
        tasks: {
          include: {
            checklists: true,
          },
        },
      },
    });

    if (!template) return null;

    return ProjectTemplate.create({
      id: template.id,
      name: template.name,
      description: template.description ?? undefined,
      tasks: template.tasks.map((task) =>
        TaskTemplate.create({
          id: task.id,
          title: task.title,
          description: task.description ?? undefined,
          order: task.order,
          projectTemplateId: task.projectTemplateId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          checklists: task.checklists.map((c) =>
            ChecklistTemplate.create({
              id: c.id,
              title: c.title,
              taskTemplateId: c.taskTemplateId,
              createdAt: c.createdAt,
              updatedAt: c.updatedAt,
            })
          ),
        })
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
