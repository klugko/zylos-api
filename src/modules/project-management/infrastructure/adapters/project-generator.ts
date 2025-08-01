import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { Task } from '../../domain/entities/task.entity';
import { Checklist } from '../../domain/entities/checklist.entity';
import { OpenAIService } from './openapi.service';
import { ChecklistPriority, ChecklistStatus } from '@modules/project-management/domain/enums/checklist.enums';

/*──────────────── ZOD – Validation de la réponse GPT ────────────────*/
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

/*────────────────────────── SERVICE ──────────────────────────*/
@Injectable()
export class ProjectStructureGenerator {
  private readonly logger = new Logger(ProjectStructureGenerator.name);
  private static readonly MAX_RETRIES = 3;

  constructor(private readonly openAi: OpenAIService) {}

  /*──────────────── PUBLIC API ────────────────*/
  async generate(project: {
    id: string;
    name: string;
    description: string | null;
  }): Promise<{ tasks: Task[]; checklists: Checklist[] }> {
    const prompt = this.buildPrompt(project.name, project.description ?? '');

    for (let attempt = 1; attempt <= ProjectStructureGenerator.MAX_RETRIES; attempt++) {
      try {
        const raw = await this.openAi.ask(prompt);
        const parsed = this.safeParse(raw);
        return this.mapToEntities(parsed, project.id);
      } catch (err) {
        this.logger.error(
          `GPT response validation failed (attempt ${attempt}/${ProjectStructureGenerator.MAX_RETRIES}): ${err.message}`,
        );
        if (attempt === ProjectStructureGenerator.MAX_RETRIES) throw err;
      }
    }
    /* istanbul ignore next */
    throw new Error('GPT parsing retries exhausted');
  }

  /*──────────────── HELPERS ───────────────────*/
  /** Prompt détaillé + garde-fous */
  private buildPrompt(name: string, description: string): string {
    return [
      'Tu es un gestionnaire de projet senior. Génère la structure suivante **en retournant UNIQUEMENT du JSON strict** :',
      '',
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
      '      "checklist": ["Élément 1", "... (4-8 éléments)"]',
      '    }',
      '  ]',
      '}',
      '',
      'Règles :',
      '1. Au moins 3 tâches.',
      '2. Chaque tâche contient 4-8 éléments dans "checklist".',
      '3. **AUCUN** texte en dehors du JSON (pas de ``` ni de commentaire).',
      '',
      `Contexte : Projet « ${name} » – ${description || 'Sans description'}`,
    ].join('\n');
  }

  /** Tente d’extraire et valider le JSON */
  private safeParse(raw: string): AiResponse {
    const jsonStr = this.extractJson(raw);
    let jsonObj: unknown;
    try {
      jsonObj = JSON.parse(jsonStr);
    } catch {
      this.logger.error('❌ JSON.parse failed');
      throw new Error('GPT output is not valid JSON');
    }
    return responseSchema.parse(jsonObj);
  }

  /**
   * Nettoie la réponse GPT : supprime ```json ``` éventuels,
   * isole le premier bloc “{ … }”.
   */
  private extractJson(raw: string): string {
    let text = raw.trim();

    // Retire les fences ```json … ``` ou ``` … ```
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    }

    // Si le modèle ajoute prose, tenter d’isoler le premier objet JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('No JSON object detected in GPT output');
    }
    return text.slice(firstBrace, lastBrace + 1);
  }

  /** Mapping JSON → Domain */
  private mapToEntities(parsed: AiResponse, projectId: string): {
    tasks: Task[];
    checklists: Checklist[];
  } {
    const now = new Date();
    const tasks: Task[] = [];
    const checklists: Checklist[] = [];

    parsed.tasks.forEach((t) => {
      const taskId = uuid();
      tasks.push(
        new Task(
          taskId,
          t.title,
          t.description,
          t.status as any,
          t.priority as any,
          projectId,
          now,
          now,
          null,
          null,
        ),
      );
      t.checklist.forEach((item) =>
        checklists.push(
          new Checklist(
            uuid(),
            item,
            projectId,
            taskId,
            now,
            now,
            ChecklistStatus.TODO,
            ChecklistPriority.MEDIUM
          )
        ),
      );
    });

    return { tasks, checklists };
  }
}
