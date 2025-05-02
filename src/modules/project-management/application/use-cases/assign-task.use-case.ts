import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { ProjectGateway } from '../../infrastructure/websocket/project.gateway';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { AuthRepository } from 'src/modules/auth/domain/interfaces/auth-repository.interface';


@Injectable()
export class AssignTaskToBestUserUseCase {
  constructor(
    @Inject('TaskRepository')
    private readonly taskRepo: TaskRepository,

    @Inject('AuthRepository')  
    private readonly userRepo: AuthRepository,

    private readonly openai: OpenAIService,
    private readonly gateway: ProjectGateway,
  ) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);
    if (!task){
        throw new Error(`Task with ID ${taskId} not found`);
    }

    const users = await this.userRepo.findAllActive(); 
    const prompt = this.buildPrompt(task, users);

    const result = await this.openai.ask(prompt);

    const bestUser = users.find(u => result.includes(u.fullname) || result.includes(u.id));
    if (!bestUser) throw new Error('No suitable user found');

    task['assignedUserId'] = bestUser.id;
    const updated = await this.taskRepo.update(task);

    this.gateway.emitProjectUpdate(task.projectId, {
      type: 'task_assigned',
      task: updated,
      assignedTo: bestUser.fullname,
    });

    return updated;
  }

  private buildPrompt(task: Task, users: any[]): string {
    return `
Je veux attribuer la tâche suivante :

- Titre : ${task.title}
- Description : ${task.description ?? 'Aucune'}
- Statut actuel : ${task.status}

Voici les utilisateurs disponibles :
${users.map(u => `
  - Nom : ${u.fullname}
    Compétences : ${u.skills.join(', ')}
    Disponibilité : ${u.availability}
    Score : ${u.performanceScore}
`).join('\n')}

Quel est le meilleur utilisateur pour cette tâche ? Réponds uniquement avec son nom ou ID.
    `;
  }
}
