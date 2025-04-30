import { Injectable, Inject } from '@nestjs/common';
import { CreateProjectDto } from '../dto/create-project.dto';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { GptChecklistService } from '../../infrastructure/adapters/gpt-checklist.service';
import { Project } from '../../domain/entities/project.entity';
import { Checklist } from '../../domain/entities/checklist.entity';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('ProjectRepository') private readonly projectRepo: ProjectRepository,
    @Inject('ChecklistRepository') private readonly checklistRepo: ChecklistRepository,
    private readonly gptService: GptChecklistService
  ) {}

  async execute(dto: CreateProjectDto): Promise<Project> {
    const now = new Date();
    const project = new Project(
      uuidv4(),
      dto.name,
      dto.description ?? null,
      dto.type,
      false,
      now,
      now
    );

    const saved = await this.projectRepo.create(project);

    const checklists = await this.gptService.generateChecklist(dto.name, dto.description ?? '');
    await Promise.all(
      checklists.map((title) =>
        this.checklistRepo.create(
          new Checklist(
            uuidv4(),
            title,
            false,
            saved.id,
            now,
            now
          )
        )
      )
    );

    return saved;
  }
}