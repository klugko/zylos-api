import { Inject, Injectable, Logger } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { AuthRepository } from '@modules/auth/domain/interfaces/auth-repository.interface';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { ProjectGateway } from '../../infrastructure/websocket/project.gateway';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class AssignManyTasksUseCase {
  private readonly logger = new Logger(AssignManyTasksUseCase.name);

  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
    @Inject('AuthRepository') private readonly userRepo: AuthRepository,
    private readonly openai: OpenAIService,
    private readonly gateway: ProjectGateway,
  ) {}

  /**
   * Assigne intelligemment un lot de tâches.
   * @param taskIds titres / descriptions facultatifs déjà récupérés par le contrôleur
   * @returns tableau des tâches mises à jour
   */
  async execute(descriptors: { id: string; title?: string; description?: string }[]): Promise<Task[]> {
    const users = await this.userRepo.findAllActive();

    const assignments: { taskId: string; userId: string }[] = [];

    for (const desc of descriptors) {
      const task = await this.taskRepo.findById(desc.id);
      if (!task) {
        this.logger.warn(`Task ${desc.id} introuvable – ignorée`);
        continue;
      }

      // Les éventuelles valeurs override (titre / description) :
      if (desc.title) task.title = desc.title;
      if (desc.description) task.description = desc.description;

      const prompt = this.buildPrompt(task, users);
      let bestUserId: string | null;

      try {
        const raw = await this.openai.ask(prompt);
        bestUserId = JSON.parse(raw)?.id;
      } catch {
        bestUserId = users.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.id ?? null;
      }

      if (!bestUserId) {
        this.logger.warn(`Aucun utilisateur choisi pour la tâche ${task.id}`);
        continue;
      }

      assignments.push({ taskId: task.id, userId: bestUserId });
    }

    if (!assignments.length) return [];

    const updated = await this.taskRepo.assignMany(assignments);

    // Web-socket broadcast (une fois) :
    updated.forEach(t =>
      this.gateway.emitProjectUpdate(t.projectId, {
        type: 'task_assigned',
        task: t,
        assignedTo: assignments.find(a => a.taskId === t.id)?.userId,
      }),
    );

    this.logger.log(`Assignations terminées : ${updated.length} tâche(s)`);
    return updated;
  }

  private buildPrompt(task: Task, users: any[]): string {
    return `
Tu es un assistant d'affectation de tâches.

### Tâche
- Titre : ${task.title}
- Description : ${task.description ?? 'Aucune'}
- Statut : ${task.status}

### Candidats
${users
  .map(
    u => `{
  "id":"${u.id}",
  "fullname":"${u.fullname}",
  "skills":["${u.skills.join('","')}"],
  "availability":${u.availability},
  "performanceScore":${u.performanceScore}
}`,
  )
  .join(',\n')}

### Instructions
Choisis le meilleur candidat et **retourne uniquement** :
{ "id":"ID_DU_MEILLEUR_UTILISATEUR" }`;
  }
}
