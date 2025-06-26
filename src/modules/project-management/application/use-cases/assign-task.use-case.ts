
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { AuthRepository } from 'src/modules/auth/domain/interfaces/auth-repository.interface';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { ProjectGateway } from '../../infrastructure/websocket/project.gateway';
import { Task } from '../../domain/entities/task.entity';

@Injectable()
export class AssignTaskToBestUserUseCase {
  private readonly logger = new Logger(AssignTaskToBestUserUseCase.name);

  constructor(
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
    @Inject('AuthRepository') private readonly userRepo: AuthRepository,
    private readonly openai: OpenAIService,
    private readonly gateway: ProjectGateway,
  ) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error(`Task with ID ${taskId} not found`);

    const users = await this.userRepo.findAllActive();
    const prompt = this.buildPrompt(task, users);

    let bestUserId: string | null = null;
    try {
      const result = await this.openai.ask(prompt);
      const json = JSON.parse(result);
      bestUserId = json.id;
    } catch (err) {
      this.logger.warn('Fallback triggered: OpenAI failed or invalid response');
      bestUserId = users.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.id ?? null;
    }

    const bestUser = users.find(u => u.id === bestUserId);
    if (!bestUser) throw new Error('Aucun utilisateur valide trouvé');

    task.assignedUserId = bestUser.id;
    const updated = await this.taskRepo.update(task);

    this.logger.log(`Tâche ${task.id} assignée à ${bestUser.fullname}`);

    this.gateway.emitProjectUpdate(task.projectId, {
      type: 'task_assigned',
      task: updated,
      assignedTo: bestUser.fullname,
    });

    return updated;
  }

  private buildPrompt(task: Task, users: any[]): string {
    return `
    Tu es un assistant chargé d'assigner la tâche suivante à la personne la plus compétente.

    ### Tâche à assigner :
    - Titre : ${task.title}
    - Description : ${task.description ?? 'Aucune'}
    - Statut : ${task.status}

    ### Candidats :
    ${users.map(u => `{
      \"id\": \"${u.id}\",
      \"fullname\": \"${u.fullname}\",
      \"skills\": [\"${u.skills.join('\", \"')}\"],
      \"availability\": ${u.availability},
      \"performanceScore\": ${u.performanceScore}
    }`).join(',\n')}

    ### Instructions :
    Analyse les compétences, la disponibilité et le score. Choisis le meilleur utilisateur **et retourne uniquement un objet JSON** comme ci-dessous :

    {
      \"id\": \"ID_DU_MEILLEUR_UTILISATEUR\"
    }`;
      }
}
