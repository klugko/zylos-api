import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import { v4 as uuid } from 'uuid';
import { z } from 'zod';

import { PrismaService } from '@core/prisma/prisma.service';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { Task } from '../../domain/entities/task.entity';
import { Checklist } from '../../domain/entities/checklist.entity';
import { Project } from '../../domain/entities/project.entity';
import {
  ProjectClientType,
  ProjectPriority,
  ProjectStatus,
} from '../../domain/enums/project.enums';
import {
  TaskPriority,
  TaskStatus,
} from '../../domain/enums/task.enums';

/*────────── ZOD – Format IA strict ──────────*/
const checklistSchema = z.string().min(1);

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  estimatedTime: z.number().positive().int(),
  checklist: z.array(checklistSchema).min(4).max(8),
});

const responseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  tasks: z.array(taskSchema).min(3),
});

type AiResponse = z.infer<typeof responseSchema>;

@Injectable()
export class CreateProjectFromPdfUseCase {
  private readonly logger = new Logger(CreateProjectFromPdfUseCase.name);
  private static readonly MAX_RETRIES = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenAIService,
  ) {}

  async execute(filePath: string, ownerId: string): Promise<{ project: Project; taskCount: number }> {
    const now = new Date();

    try {
      // ① Lire et parser le PDF
      const buffer = await fs.readFile(filePath);
      const parsed = await pdfParse(buffer);
      const content = parsed.text.trim().replace(/\s{2,}/g, ' ');

      if (!content || content.length < 50) {
        throw new Error('PDF vide ou insuffisant.');
      }

      // ② Générer via GPT (hors transaction)
      const prompt = this.buildPrompt(content);
      const ai = await this.getValidAiResponse(prompt);

      // ③ Mapper vers entités
      const projectId = uuid();
      const project = new Project(
        projectId,
        ai.title,
        ai.description,
        'SIMPLE',
        null,
        null,
        null,
        null,
        null,
        0,
        ProjectStatus.NOT_STARTED,
        ProjectPriority.MEDIUM,
        false,
        now,
        now,
        ownerId ?? null,
        null
      );

      const tasks: Task[] = [];
      const checklists: Checklist[] = [];
      const checklistData = checklists.map((c) => ({
        id: c.id,
        title: c.title,
        isCompleted: c.isCompleted,
        projectId: c.projectId,
        taskId: c.taskId!, 
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      

      ai.tasks.forEach((t) => {
        const taskId = uuid();
        tasks.push(
          new Task(
            taskId,
            t.title,
            t.description,
            t.status as TaskStatus,
            t.priority as TaskPriority,
            projectId,
            now,
            now,
            null,
            null
          ),
        );

        t.checklist.forEach((item) => {
          checklists.push(
            new Checklist(
              uuid(),
              item,
              false,
              projectId,
              now,
              now,
              taskId
            ),
          );
        });
      });

      // ④ Transaction rapide et atomique
      await this.prisma.$transaction([
        this.prisma.project.create({
          data: {
            id: project.id,
            name: project.name,
            description: project.description,
            clientType: project.clientType as ProjectClientType,
            status: project.status as ProjectStatus,
            priority: project.priority as ProjectPriority,
            progress: project.progress,
            isArchived: project.isArchived,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          },
        }),
        this.prisma.task.createMany({ data: tasks, skipDuplicates: true }),
        this.prisma.checklist.createMany({ data: checklistData, skipDuplicates: true })
      ]);

      return { project, taskCount: tasks.length };
    } catch (err) {
      this.logger.error(`Erreur analyse PDF : ${err.message}`, err.stack);
      throw new InternalServerErrorException('Erreur lors du traitement du fichier PDF.');
    }
  }

  private buildPrompt(text: string): string {
    return [
      'Tu es un assistant en gestion de projet.',
      '',
      'Objectif : générer une structure de projet à partir du cahier des charges ci-dessous.',
      '',
      'Retourne UNIQUEMENT ce JSON strict, sans commentaire :',
      '{',
      '  "title": "Titre du projet",',
      '  "description": "Description globale",',
      '  "tasks": [',
      '    {',
      '      "title": "Nom de la tâche",',
      '      "description": "But de la tâche",',
      '      "status": "TODO | IN_PROGRESS | DONE | CANCELLED",',
      '      "priority": "LOW | MEDIUM | HIGH | URGENT",',
      '      "estimatedTime": 8,',
      '      "checklist": ["Élément 1", "... (4 à 8 éléments)"]',
      '    }',
      '  ]',
      '}',
      '',
      'Règles :',
      '1. Au moins 3 tâches.',
      '2. Chaque tâche contient entre 4 et 8 éléments dans "checklist".',
      '3. Pas de texte en dehors du JSON.',
      '',
      '### Cahier des charges :',
      '"""',
      text.slice(0, 3500),
      '"""',
    ].join('\n');
  }

  private async getValidAiResponse(prompt: string): Promise<AiResponse> {
    for (let attempt = 1; attempt <= CreateProjectFromPdfUseCase.MAX_RETRIES; attempt++) {
      try {
        const raw = await this.openai.ask(prompt);
        const parsed = this.safeParse(raw);
        return parsed;
      } catch (err) {
        this.logger.warn(`❌ Validation GPT échouée (tentative ${attempt}): ${err.message}`);
        if (attempt === CreateProjectFromPdfUseCase.MAX_RETRIES) throw err;
      }
    }
    throw new Error('GPT parsing retries exhausted');
  }

  private safeParse(raw: string): AiResponse {
    const text = this.cleanJson(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      this.logger.error('❌ JSON.parse failed');
      throw new Error('Réponse IA invalide (non JSON)');
    }
    return responseSchema.parse(parsed);
  }

  private cleanJson(raw: string): string {
    let text = raw.trim();

    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    }

    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first === -1 || last === -1 || last <= first) {
      throw new Error('Aucun JSON détecté dans la réponse');
    }

    return text.slice(first, last + 1);
  }
}
