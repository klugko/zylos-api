import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';


@Injectable()
export class OpenAIService {
  private readonly apiKey = process.env.OPENAI_API_KEY;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';
  private readonly logger = new Logger(OpenAIService.name);

  async ask(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      this.logger.error('❌ GPT API call failed:', error?.message || error);
      throw new Error('OpenAI call failed');
    }
  }
}
