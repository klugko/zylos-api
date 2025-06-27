import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as pdfParse from 'pdf-parse';
import { OpenAIService } from '../../infrastructure/adapters/openapi.service';
import { ProjectRepository } from '../../domain/interfaces/project-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { Project } from '../../domain/entities/project.entity';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';
import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';

@Injectable()
export class CreateProjectFromPdfUseCase {
  private readonly logger = new Logger(CreateProjectFromPdfUseCase.name);

  constructor(
    @Inject('ProjectRepository') private readonly projectRepo: ProjectRepository,
    @Inject('ChecklistRepository') private readonly checklistRepo: ChecklistRepository,
    private readonly openai: OpenAIService
  ) {}

  async execute(filePath: string): Promise<{ project: Project; checklistCount: number }> {
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

      if (!result.project || !Array.isArray(result.checklists)) {
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
        "userId-placeholder", 
        null
      );

      const created = await this.projectRepo.create(project);

      let checklistCount = 0;
      for (const item of result.checklists ?? []) {
        const checklist = new Checklist(
          uuidv4(),
          item.title,
          false,
          created.id,
          now,
          now
        );
        await this.checklistRepo.create(checklist);
        checklistCount++;
      }

      return {
        project: created,
        checklistCount,
      };
    } catch (error) {
      this.logger.error(`Erreur analyse PDF : ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erreur pendant le traitement du document PDF.');
    }
  }

  private buildPrompt(text: string): string {
    return `
    Tu es un assistant intelligent. À partir du contenu suivant extrait d’un cahier des charges, tu dois générer :

    - Un objet JSON "project" avec les champs : name, description (texte court), clientType (SIMPLE/CODEUR), priority (LOW/MEDIUM/HIGH).
    - Un tableau "checklists" avec des objets contenant : title (libellé de la tâche ou étape à vérifier).

    ### Contenu du document :
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
      "checklists": [
        { "title": "..." },
        { "title": "..." }
      ]
    }
    `;
  }
}
