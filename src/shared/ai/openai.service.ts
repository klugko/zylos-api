import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly endpoint = 'https://api.openai.com/v1/chat/completions';

  async summarizeText(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      return response.data.choices?.[0]?.message?.content?.trim() ?? 'Résumé non généré.';
    } catch (error) {
      console.error('Erreur OpenAI:', error.response?.data || error.message);
      throw new InternalServerErrorException('Échec de la génération du résumé IA.');
    }
  }
}
