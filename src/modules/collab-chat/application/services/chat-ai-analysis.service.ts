import { Injectable, Logger } from '@nestjs/common';
import { ProjectChatMessage } from '../../domain/entities/project-chat-message.entity';
import { CreateTaskUseCase } from '@modules/project-management/application/use-cases/create-task.use-case';
import { CreateTaskDto } from '@modules/project-management/application/dto/create-task.dto';
import { OpenAiChatAnalysisService } from './openai-chat-analysis.service';

/**
 * Service dédié à l’analyse IA des messages de chat.
 * Appelle l’API OpenAI pour détecter des tâches,
 * puis crée automatiquement ces tâches dans le projet concerné.
 */
@Injectable()
export class ChatAiAnalysisService {
  private readonly logger = new Logger(ChatAiAnalysisService.name);

  constructor(
    private readonly openAi: OpenAiChatAnalysisService,
    private readonly createTaskUseCase: CreateTaskUseCase,
  ) {}

  /**
   * Analyse le contenu d’un message et crée automatiquement les tâches détectées.
   * @param message ProjectChatMessage
   */
  async analyzeAndSuggestTasks(message: ProjectChatMessage): Promise<void> {
    try {
      this.logger.log(
        `[AI] Analyse du message ${message.id} (projet: ${message.projectId}, auteur: ${message.senderId})`,
      );

      // Extraire les suggestions depuis l'IA
      const suggestions = await this.openAi.extractTasks(message.content);

      if (!suggestions || suggestions.length === 0) {
        this.logger.debug(`[AI] Aucune tâche détectée dans le message ${message.id}`);
        return;
      }

      this.logger.log(`[AI] ${suggestions.length} tâche(s) détectée(s). Création automatique…`);

      for (const suggestion of suggestions) {
        const dto: CreateTaskDto = {
          title: suggestion.title,
          description: suggestion.description || null,
          projectId: message.projectId,
          startDate: null,
          endDate: null,
          dependencies: null,
          assignedUserId: null,
          columnId: null,
        };

        await this.createTaskUseCase.execute(dto);

        this.logger.log(`[AI] Tâche "${dto.title}" créée pour le projet ${dto.projectId}`);
      }
    } catch (error: any) {
      this.logger.error(
        `[AI] Erreur d’analyse pour le message ${message.id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
