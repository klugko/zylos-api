import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { Survey } from "../../domain/entities/survey.entity";
import { GetSurveysDto } from "../../application/dto/survey-query.dto";
import {
  SurveyType,
  SurveyStatus,
  VoteType,
} from "../../domain/enums/survey.enums";

@Injectable()
export class PrismaSurveyRepository implements SurveyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(survey: Survey): Promise<Survey> {
    const created = await this.prisma.survey.create({
      data: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        type: survey.type,
        status: survey.status,
        voteType: survey.voteType,
        projectId: survey.projectId,
        taskId: survey.taskId,
        allowMultipleVotes: survey.allowMultipleVotes,
        isAnonymous: survey.isAnonymous,
        maxVotesPerUser: survey.maxVotesPerUser,
        weightEnabled: survey.weightEnabled,
        startDate: survey.startDate,
        endDate: survey.endDate,
        creatorId: survey.creatorId,
        createdAt: survey.createdAt,
        updatedAt: survey.updatedAt,
      },
    });

    return this.mapToEntity(created);
  }

  async findById(id: string): Promise<Survey | null> {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
    });

    return survey ? this.mapToEntity(survey) : null;
  }

  async findByProjectId(projectId: string): Promise<Survey[]> {
    const surveys = await this.prisma.survey.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return surveys.map((survey) => this.mapToEntity(survey));
  }

  async findByTaskId(taskId: string): Promise<Survey[]> {
    const surveys = await this.prisma.survey.findMany({
      where: { taskId },
      orderBy: { createdAt: "desc" },
    });

    return surveys.map((survey) => this.mapToEntity(survey));
  }

  async findByCreatorId(creatorId: string): Promise<Survey[]> {
    const surveys = await this.prisma.survey.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
    });

    return surveys.map((survey) => this.mapToEntity(survey));
  }

  async findMany(
    query: GetSurveysDto
  ): Promise<{ surveys: Survey[]; total: number }> {
    const where: any = {};

    if (query.projectId) where.projectId = query.projectId;
    if (query.taskId) where.taskId = query.taskId;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;

    const [surveys, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.survey.count({ where }),
    ]);

    return {
      surveys: surveys.map((survey) => this.mapToEntity(survey)),
      total,
    };
  }

  async update(id: string, data: Partial<Survey>): Promise<Survey> {
    const updated = await this.prisma.survey.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.type && { type: data.type }),
        ...(data.status && { status: data.status }),
        ...(data.voteType && { voteType: data.voteType }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
        ...(data.taskId !== undefined && { taskId: data.taskId }),
        ...(data.allowMultipleVotes !== undefined && {
          allowMultipleVotes: data.allowMultipleVotes,
        }),
        ...(data.isAnonymous !== undefined && {
          isAnonymous: data.isAnonymous,
        }),
        ...(data.maxVotesPerUser !== undefined && {
          maxVotesPerUser: data.maxVotesPerUser,
        }),
        ...(data.weightEnabled !== undefined && {
          weightEnabled: data.weightEnabled,
        }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        updatedAt: new Date(),
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.survey.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.survey.count({
      where: { id },
    });
    return count > 0;
  }

  private mapToEntity(data: any): Survey {
    return new Survey(
      data.id,
      data.title,
      data.description,
      data.type as SurveyType,
      data.status as SurveyStatus,
      data.voteType as VoteType,
      data.projectId,
      data.taskId,
      data.allowMultipleVotes,
      data.isAnonymous,
      data.maxVotesPerUser,
      data.weightEnabled,
      data.startDate,
      data.endDate,
      data.creatorId,
      data.createdAt,
      data.updatedAt
    );
  }
}
