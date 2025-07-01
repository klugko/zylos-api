import { IOpenAIAIService } from '@modules/project-management/domain/interfaces/IOpenAIAIService.interface';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAIAIService implements IOpenAIAIService {
  private readonly logger = new Logger(OpenAIAIService.name);
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  constructor() {
    if (!this.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
  }

  async generateTasksAndChecklists(projectName: string, projectDescription: string): Promise<{
    title: string;
    description: string;
    tasks: {
      title: string;
      description: string;
      status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      estimatedTime: number;
      checklist: string[];
    }[];
  }> {
    const prompt = this.buildPrompt(projectName, projectDescription);

    try {
      const response = await axios.post(
        this.OPENAI_API_URL,
        {
          model: 'gpt-4',
          temperature: 0.5,
          max_tokens: 1800,
          messages: [
            {
              role: 'system',
              content: 'Tu es un assistant IA expert en gestion de projet technique.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, 
        },
      );

      const content = response.data?.choices?.[0]?.message?.content?.trim() ?? '{}';
      const parsed = JSON.parse(content);

      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error('Invalid format: "tasks" array missing.');
      }

      if (parsed.tasks.length < 3) {
        throw new Error('Invalid structure: at least 3 tasks required.');
      }

      return parsed;
    } catch (error) {
      this.logger.error('[OpenAIAIService] IA generation error', error);
      return {
        title: projectName,
        description: projectDescription,
        tasks: [],
      };
    }
  }

  private buildPrompt(name: string, description: string): string {
    return `
Tu dois générer un plan de projet structuré pour "${name}" (description : "${description}").

🔸 Retourne le résultat sous **format JSON strict**, structuré comme suit :

{
  "title": "Titre du projet",
  "description": "Description globale",
  "tasks": [
    {
      "title": "Nom de la tâche",
      "description": "But de la tâche",
      "status": "TODO",
      "priority": "HIGH",
      "estimatedTime": 8,
      "checklist": [
        "Élément 1",
        "Élément 2"
      ]
    }
  ]
}

🔸 Contraintes :
- Donne **au moins 3 tâches**
- Chaque tâche doit contenir **4 à 8 éléments** dans "checklist"
- Ne renvoie que du JSON (aucun commentaire, aucune explication)
`.trim();
  }
}
