import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface SuggestedTask {
  title: string;
  description: string;
}

@Injectable()
export class OpenAiChatAnalysisService {
  private readonly logger = new Logger(OpenAiChatAnalysisService.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  /**
   * Appelle l’API OpenAI via Axios pour analyser le contenu d’un message
   * et retourner une liste de tâches suggérées.
   */
  async extractTasks(content: string): Promise<SuggestedTask[]> {
    const prompt = `
    Le texte ci-dessous est un message de chat dans un projet.
    Analyse le message et détecte les tâches qui doivent être créées.
    Renvoie un JSON array sous forme [{"title": "...", "description": "..."}].
    Message: """${content}"""
    `;

        try {
          const response = await axios.post(
            this.apiUrl,
            {
              model: 'gpt-4o-mini', 
              messages: [
                {
                  role: 'system',
                  content: 'Tu es un assistant qui extrait des tâches depuis des discussions projet.',
                },
                { role: 'user', content: prompt },
              ],
              temperature: 0,
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
              },
              timeout: 15000, // 15 secondes
            },
          );

          const rawContent = response.data.choices?.[0]?.message?.content?.trim();
          if (!rawContent) {
            this.logger.warn('[AI] Réponse OpenAI vide ou invalide');
            return [];
          }

          let suggestions: SuggestedTask[] = [];
          try {
            suggestions = JSON.parse(rawContent);
          } catch {
            this.logger.warn('[AI] Impossible de parser la réponse en JSON');
            return [];
          }

          return suggestions
            .filter((s) => s.title && s.title.length > 0)
            .map((s) => ({
              title: s.title.trim(),
              description: s.description?.trim() ?? '',
            }));
        } catch (err: any) {
          this.logger.error(`[AI] Échec de la requête OpenAI : ${err.message}`);
          return [];
        }
      }
    }
