import { IAIEstimationService } from '@modules/project-management/domain/interfaces/ai-estimation.service.interface';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class AIEstimationService implements IAIEstimationService {
  private readonly logger = new Logger(AIEstimationService.name);
  private readonly openaiApiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly openaiApiKey = process.env.OPENAI_API_KEY;

  async estimateFromData(data: any): Promise<{
    estimatedDuration: number;
    estimatedBudget: number;
    estimatedEndDate: Date;
  }> {
    const prompt = `
    Tu es un assistant de gestion de projet.
    À partir des informations suivantes (projet, tâches, checklists), estime :
    - la durée estimée (en jours ouvrés)
    - le budget total estimé en dollars US (250$/jour par défaut)
    - la date de fin probable à partir d'aujourd’hui

    Voici les données projet :
    ${JSON.stringify(data, null, 2)}

    Retourne strictement un JSON au format :
    {
    "estimatedDuration": number,
    "estimatedBudget": number,
    "estimatedEndDate": "YYYY-MM-DD"
    }
    `;

    const response = await axios.post(
      this.openaiApiUrl,
      {
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
      },
    );

    function extractJson(raw: string): string {
        return raw
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
      }
      

    const content = response.data.choices[0].message.content;
    const cleaned = extractJson(content);
    const parsed = JSON.parse(cleaned);
    

    return {
      estimatedDuration: parsed.estimatedDuration,
      estimatedBudget: parsed.estimatedBudget,
      estimatedEndDate: dayjs(parsed.estimatedEndDate).toDate(),
    };
  }
}
