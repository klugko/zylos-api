import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class GptChecklistService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly logger = new Logger(GptChecklistService.name);

  async generateChecklist(projectName: string, projectDescription: string): Promise<string[]> {
    const prompt = `Tu es un assistant de gestion de projet. En te basant sur le projet suivant :
Nom : "${projectName}", 
Description : "${projectDescription}", 
Génère une liste de tâches essentielles (checklist) adaptées à ce projet. Réponds uniquement par une liste JSON : ["tâche 1", "tâche 2", ...]`;

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      let raw = response.data.choices[0].message.content.trim();

      raw = raw.replace(/```json|```/g, '').trim();

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid checklist format from GPT');
      return parsed;
    } catch (error) {
      this.logger.error('GPT Checklist generation failed:', error.message || error);
      return [];
    }
  }
}
