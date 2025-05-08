import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmbeddingService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  async embedText(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  getOpenAI(): OpenAI {
    return this.openai;
  }
}
