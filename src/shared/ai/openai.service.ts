import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

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

  async generateCompletion(request: OpenAICompletionRequest): Promise<any> {
    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: request.model,
          messages: request.messages,
          temperature: request.temperature || 0.5,
          response_format: request.response_format,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          timeout: 10000,
        },
      );

      return response.data;
    } catch (error) {
      console.error('Erreur OpenAI:', error.response?.data || error.message);
      throw new InternalServerErrorException('Échec de la génération IA.');
    }
  }
}