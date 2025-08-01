import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from 'src/modules/project-management/infrastructure/adapters/openapi.service';
import { AuthRepository } from 'src/modules/auth/domain/interfaces/auth-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ProjectGateway } from '../../infrastructure/websocket/project.gateway';

@Injectable()
export class AssignChecklistToBestUserUseCase {
  private readonly logger = new Logger(AssignChecklistToBestUserUseCase.name);

  constructor(
    @Inject('ChecklistRepository') private readonly checklistRepo: ChecklistRepository,
    @Inject('AuthRepository') private readonly userRepo: AuthRepository,
    private readonly openai: OpenAIService,
    private readonly gateway: ProjectGateway,
  ) {}

  async execute(checklistId: string): Promise<Checklist> {
    const checklist = await this.checklistRepo.findById(checklistId);
    if (!checklist) throw new Error(`Checklist ${checklistId} non trouvée`);

    const users = await this.userRepo.findAllActive();
    const prompt = this.buildPrompt(checklist, users);

    let bestUserId: string | null = null;
    try {
      const result = await this.openai.ask(prompt);
      const json = JSON.parse(result);
      bestUserId = json.id;
    } catch (err) {
      this.logger.warn('OpenAI échoué ou réponse invalide. Fallback sur best performanceScore');
      bestUserId = users.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.id ?? null;
    }

    const bestUser = users.find(u => u.id === bestUserId);
    if (!bestUser) throw new Error('Aucun utilisateur valide trouvé');

    checklist.assignedUserId = bestUser.id;
    const updated = await this.checklistRepo.update(checklist);

    this.gateway.emitProjectUpdate(checklist.projectId, {
      type: 'checklist_assigned',
      checklistId: checklist.id,
      assignedTo: bestUser.fullname,
    });

    return updated;
  }

  private buildPrompt(checklist: Checklist, users: any[]): string {
    return `
Tu es un assistant IA expert en gestion de projet.

### Checklist à assigner :
- Titre : ${checklist.title}
- Statut : ${checklist.status}
- Priorité : ${checklist.priority}

### Candidats :
${users.map(u => `{
  "id": "${u.id}",
  "fullname": "${u.fullname}",
  "skills": [${u.skills.map(s => `"${s}"`).join(', ')}],
  "availability": ${u.availability},
  "performanceScore": ${u.performanceScore}
}`).join(',\n')}

### Instructions :
Choisis l’utilisateur le plus compétent. Retourne uniquement ce JSON :

{ "id": "ID_DU_MEILLEUR_UTILISATEUR" }
`;
  }
}
