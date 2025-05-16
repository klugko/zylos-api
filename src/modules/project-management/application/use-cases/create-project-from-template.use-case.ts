import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { CreateProjectFromTemplateDto } from '../dto/create-project-from-template.dto';
import { ProjectTemplateRepository } from '../../domain/interfaces/project-template.repository.interface';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';
import { v4 as uuidv4 } from 'uuid';
import { TaskStatus } from '../../domain/enums/task.enums';
import { TaskPriority } from '../../domain/enums/task.enums';
import { Task } from '../../domain/entities/task.entity';
import { Checklist } from '../../domain/entities/checklist.entity';


@Injectable()
export class CreateProjectFromTemplateUseCase {
  constructor(
    @Inject('ProjectRepository')
    private readonly projectRepository: ProjectRepository,
    @Inject('ProjectTemplateRepository')
    private readonly projectTemplateRepository: ProjectTemplateRepository,
    
  ) {}

  async execute(dto: CreateProjectFromTemplateDto): Promise<Project> {
    const template = await this.projectTemplateRepository.findByIdWithTasks(dto.templateId);

    if (!template) {
      throw new NotFoundException('Project template not found');
    }

    const now = new Date();
    const project = new Project(
      uuidv4(), // id
      dto.name,
      dto.description ?? null,
      ProjectClientType.SIMPLE,
      null,           // industry
      null,           // color
      dto.startDate ?? null,
      dto.endDate ?? null,
      null,           // budget
      0.0,            // progress
      ProjectStatus.NOT_STARTED,
      ProjectPriority.MEDIUM,
      false,          // isArchived
      now,
      now,
      dto.ownerId ?? null,
      template.id
    );

    const createdProject = await this.projectRepository.create(project);

    for (const taskTemplate of template.tasks) {
      const task =  new Task(
        uuidv4(),
        taskTemplate.title,
        taskTemplate.description ?? null,
        TaskStatus.TODO,
        TaskPriority.MEDIUM,
        createdProject.id,
        now,
        now,
        now,             // startDate
        null,            // endDate
        [],              // dependencies
        undefined        // assignedUserId
      );

      for (const checklistTemplate of taskTemplate.checklists) {
        const checklist = new Checklist(
          uuidv4(),
          checklistTemplate.title,
          false,
          checklistTemplate.taskTemplateId,
          now,
          now
        );
      }
    }

    return createdProject;
  }
}
