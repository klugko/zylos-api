import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { ProjectTemplateRepository } from '../../domain/interfaces/project-template.repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { Task } from '../../domain/entities/task.entity';
import { Checklist } from '../../domain/entities/checklist.entity';
import { CreateProjectFromTemplateDto } from '../dto/create-project-from-template.dto';
import { v4 as uuidv4 } from 'uuid';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';
import { TaskStatus, TaskPriority } from '../../domain/enums/task.enums';

@Injectable()
export class CreateProjectFromTemplateUseCase {
  constructor(
    @Inject('ProjectRepository') private readonly projectRepository: ProjectRepository,
    @Inject('ProjectTemplateRepository') private readonly projectTemplateRepository: ProjectTemplateRepository,
    @Inject('TaskRepository') private readonly taskRepository: TaskRepository,
    @Inject('ChecklistRepository') private readonly checklistRepository: ChecklistRepository,
  ) {}

  async execute(dto: CreateProjectFromTemplateDto): Promise<Project> {
    const template = await this.projectTemplateRepository.findByIdWithTasks(dto.templateId);
    if (!template) {
      throw new NotFoundException('Project template not found');
    }

    const now = new Date();
    const project = new Project(
      uuidv4(),
      dto.name,
      dto.description ?? null,
      ProjectClientType.SIMPLE,
      null,
      null,
      dto.startDate ?? null,
      dto.endDate ?? null,
      null,
      0.0,
      ProjectStatus.NOT_STARTED,
      ProjectPriority.MEDIUM,
      false,
      now,
      now,
      dto.ownerId ?? null,
      template.id
    );

    const createdProject = await this.projectRepository.create(project);

    for (const taskTemplate of template.tasks) {
      const task = new Task(
        uuidv4(),
        taskTemplate.title,
        taskTemplate.description ?? null,
        TaskStatus.TODO,
        TaskPriority.MEDIUM,
        createdProject.id,
        now,
        now,
        now,
        null,
        [],
        undefined,
        undefined
      );

      const createdTask = await this.taskRepository.create(task);

      for (const checklistTemplate of taskTemplate.checklists) {
        const checklist = new Checklist(
          uuidv4(),
          checklistTemplate.title,
          false,
          createdProject.id,
          now,
          now
        );
        await this.checklistRepository.create(checklist);
      }
    }

    return createdProject;
  }
}