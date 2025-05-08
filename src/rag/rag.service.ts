import { Injectable, OnModuleInit } from '@nestjs/common';
import { EmbeddingService } from './embedding/embedding.service';
import { cosineSimilarity } from './utils/cosine-similarity';
import { tasks } from './data/tasks';

@Injectable()
export class RagService implements OnModuleInit {
  private knowledgeBase: any[] = [];

  constructor(private embeddingService: EmbeddingService) {}

  private tacheToText(categorie: string, tache: any): string {
    const details = [
      `Tâche : ${tache.label}`,
      `Catégorie : ${categorie}`,
      `Date : ${tache.date}`,
      `Progression : ${tache.progression}%`,
      tache.urgent ? 'Urgente' : '',
      tache.participants ? `Participants : ${tache.participants}` : '',
    ];
    return details.filter(Boolean).join(' | ');
  }

  async onModuleInit() {
    for (const [categorie, listeTaches] of Object.entries(tasks)) {
      for (const tache of listeTaches as unknown as any[]) {
        const content = this.tacheToText(categorie, tache);
        const embedding = await this.embeddingService.embedText(content);
        this.knowledgeBase.push({
          id: `${categorie}-${tache.label}`,
          content,
          embedding,
        });
      }
    }
  }

  async askQuestion(question: string): Promise<string> {
    const questionEmbedding = await this.embeddingService.embedText(question);

    const ranked = this.knowledgeBase
      .map((doc) => ({
        ...doc,
        score: cosineSimilarity(doc.embedding, questionEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = ranked.map((doc) => doc.content).join('\n');

    const openai = this.embeddingService.getOpenAI();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Tu es un assistant spécialisé en gestion de projet. Tu dois analyser les tâches et répondre uniquement avec les données fournies. Ne devine rien.',
        },
        {
          role: 'user',
          content: `Voici les tâches :\n${context}\n\nQuestion : ${question}`,
        },
      ],
    });

    return completion.choices[0].message.content ?? '';
  }
}
