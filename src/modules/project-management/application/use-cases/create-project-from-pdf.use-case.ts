import { Injectable, InternalServerErrorException, Logger, Inject } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';

import { Project } from '../../domain/entities/project.entity';
import { Task } from '../../domain/entities/task.entity';

import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';
import { TaskPriority, TaskStatus } from '../../domain/enums/task.enums';

import { v4 as uuidv4 } from 'uuid';
import { ChecklistItemRepository } from '@modules/project-management/domain/interfaces/checklist-item-repository.interface';
import { ChecklistItem } from '@modules/project-management/domain/entities/checklist-item.entity';

@Injectable()
export class CreateProjectFromPdfUseCase {
  private readonly logger = new Logger(CreateProjectFromPdfUseCase.name);

  constructor(
    @Inject('ProjectRepository') private readonly projectRepo: ProjectRepository,
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
    @Inject('ChecklistItemRepository') private readonly checklistItemRepo: ChecklistItemRepository,
    private readonly openai: OpenAIService
  ) {}

  async execute(filePath: string): Promise<{ project: Project; taskCount: number }> {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);

      const text = data.text.replace(/\s{2,}/g, ' ').replace(/\n/g, '\n').trim();
      if (!text || text.length < 50) {
        throw new Error('Le contenu du PDF semble vide ou insuffisant.');
      }

      const prompt = this.buildPrompt(text);
      const rawResponse = await this.openai.ask(prompt);

      const cleaned = rawResponse
        .replace(/^```json/, '')
        .replace(/^```/, '')
        .replace(/```$/, '')
        .trim();

      let result: any;
      try {
        result = JSON.parse(cleaned);
      } catch (e) {
        this.logger.error('Réponse IA non exploitable :\n' + rawResponse);
        throw new InternalServerErrorException('Réponse IA invalide (non JSON)');
      }

      if (!result.project || !Array.isArray(result.tasks)) {
        throw new InternalServerErrorException('Structure de réponse IA incomplète ou invalide.');
      }

      const now = new Date();
      const p = result.project;

      const project = new Project(
        uuidv4(),
        p.name,
        p.description,
        p.clientType,
        null,
        null,
        null,
        null,
        null,
        0,
        ProjectStatus.NOT_STARTED,
        p.priority,
        false,
        now,
        now,
        null,
        null
      );

      const createdProject = await this.projectRepo.create(project);

      let taskCount = 0;

      for (const t of result.tasks) {
        const task = new Task(
          uuidv4(),
          t.title,
          t.description ?? null,
          TaskStatus.TODO,
          TaskPriority.MEDIUM,
          createdProject.id,
          now,
          now,
          null,
          null
        );
        const createdTask = await this.taskRepo.create(task);
        taskCount++;

        for (const c of t.checklists ?? []) {
          const checklistItem = new ChecklistItem(
            uuidv4(),
            c.title,
            false,
            createdTask.id,
            c.checklistId,
            now,
            now
          );
          await this.checklistItemRepo.create(checklistItem);
        }
      }

      return {
        project: createdProject,
        taskCount,
      };
    } catch (error) {
      this.logger.error(`Erreur analyse PDF : ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur pendant le traitement du document PDF.');
    }
  }

  private buildPrompt(text: string): string {
    return `
  Tu es un assistant intelligent. À partir du contenu suivant extrait d’un cahier des charges, génère :

  - Un objet "project" avec : name, description, clientType (SIMPLE / CODEUR), priority (LOW / MEDIUM / HIGH).
  - Un tableau "tasks" contenant :
    - title
    - description 
    - checklists : tableau avec des objets { title }

  ### Cahier des charges :
  """
  ${text.slice(0, 3500)}
  """

  Retourne UNIQUEMENT ce JSON :
  {
    "project": {
      "name": "...",
      "description": "...",
      "clientType": "SIMPLE",
      "priority": "HIGH"
    },
    "tasks": [
      {
        "title": "...",
        "description": "...",
        "checklists": [
          { "title": "..." },
          { "title": "..." }
        ]
      }
    ]
  }
      `.trim();
    }
  }