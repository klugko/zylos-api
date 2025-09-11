import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "@core/prisma/prisma.service";

import { TaskRepository } from "../../domain/interfaces/task-repository.interface";
import { ChecklistItemRepository } from "../../domain/interfaces/checklist-item-repository.interface";
import { CreateTaskDto } from "../dto/create-task.dto";
import { Task } from "../../domain/entities/task.entity";
import { ChecklistItem } from "../../domain/entities/checklist-item.entity";
import { TaskStatus, TaskPriority } from "../../domain/enums/task.enums";
import { OpenAIService } from "@modules/project-management/infrastructure/adapters/openapi.service";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class CreateTaskUseCase {
  private readonly logger = new Logger(CreateTaskUseCase.name);

  constructor(
    @Inject("TaskRepository") private readonly taskRepo: TaskRepository,
    @Inject("ChecklistItemRepository")
    private readonly checklistItemRepo: ChecklistItemRepository,
    private readonly openai: OpenAIService,
    private readonly prisma: PrismaService,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    dto: CreateTaskDto,
    userId?: string
  ): Promise<{ task: Task; checklist: ChecklistItem[] }> {
    const now = new Date();

    if (dto.startDate && dto.endDate && dto.startDate > dto.endDate) {
      throw new BadRequestException(
        "La date de début ne peut pas être après la date de fin."
      );
    }

    if (dto.dependencies?.length) {
      const invalid = [];
      for (const id of dto.dependencies) {
        const exists = await this.taskRepo.exists(id);
        if (!exists) invalid.push(id);
      }
      if (invalid.length > 0) {
        throw new NotFoundException(
          `Tâches dépendantes introuvables : ${invalid.join(", ")}`
        );
      }
    }

    const taskId = uuidv4();
    const task = new Task(
      taskId,
      dto.title,
      dto.description ?? null,
      TaskStatus.TODO,
      TaskPriority.MEDIUM,
      dto.projectId,
      now,
      now,
      dto.startDate,
      dto.endDate,
      dto.dependencies ?? [],
      dto.assignedUserId,
      dto.columnId
    );

    let checklistItems: ChecklistItem[] = [];

    if (dto.description) {
      try {
        const titles = await this.generateChecklistViaIA(
          dto.title,
          dto.description
        );
        checklistItems = titles.map(
          (title) =>
            new ChecklistItem(uuidv4(), title, false, taskId, null, now, now)
        );
      } catch (err) {
        this.logger.warn(`⚠️ Génération IA échouée : ${err.message}`);
      }
    }

    await this.prisma.$transaction([
      this.prisma.task.create({
        data: {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          projectId: task.projectId,
          startDate: task.startDate,
          endDate: task.endDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assignedUserId: task.assignedUserId,
          columnId: task.columnId,
          dependencies: task.dependencies,
        },
      }),
      ...(checklistItems.length > 0
        ? [
            this.prisma.checklistItem.createMany({
              data: checklistItems.map((item) => ({
                id: item.id,
                title: item.title,
                isChecked: item.isChecked,
                taskId: item.taskId,
                checklistId: item.checklistId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    if (userId) {
      await this.activityLogger.logTaskAction(
        userId,
        ActivityAction.TASK_CREATED,
        taskId,
        dto.projectId,
        `Tâche "${task.title}" créée`,
        `Nouvelle tâche créée avec ${checklistItems.length} éléments de checklist`,
        {
          taskTitle: task.title,
          taskStatus: task.status,
          taskPriority: task.priority,
          assignedUserId: task.assignedUserId,
          checklistItemsCount: checklistItems.length,
          hasDescription: !!task.description,
        }
      );
    }

    return {
      task,
      checklist: checklistItems,
    };
  }

  private async generateChecklistViaIA(
    title: string,
    description: string
  ): Promise<string[]> {
    const prompt = [
      "Tu es un expert en productivité.",
      "Génère une checklist claire (4 à 8 étapes) pour cette tâche :",
      `Titre : "${title}"`,
      `Description : ${description}`,
      'Format JSON strict : ["Étape 1", "Étape 2", "..."]',
    ].join("\n");

    const raw = await this.openai.ask(prompt);

    let parsed: string[];
    try {
      parsed = JSON.parse(
        raw
          .trim()
          .replace(/^```json/, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
      );
    } catch {
      throw new Error("Réponse IA invalide : JSON non parsable");
    }

    if (!Array.isArray(parsed) || parsed.length < 3 || parsed.length > 8) {
      throw new Error("Checklist IA insuffisante ou mal formée");
    }

    return parsed;
  }
}
