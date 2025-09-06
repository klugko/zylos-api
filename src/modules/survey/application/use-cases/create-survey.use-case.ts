import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { CreateSurveyDto } from "../dto/create-survey.dto";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { Survey } from "../../domain/entities/survey.entity";
import { SurveyOption } from "../../domain/entities/survey-option.entity";
import {
  SurveyType,
  SurveyStatus,
  VoteType,
} from "../../domain/enums/survey.enums";
import { PrismaService } from "@core/prisma/prisma.service";

@Injectable()
export class CreateSurveyUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("SurveyOptionRepository")
    private readonly optionRepository: SurveyOptionRepository,
    private readonly prisma: PrismaService
  ) {}

  async execute(dto: CreateSurveyDto, creatorId: string): Promise<Survey> {
    // Validation des dates
    if (
      dto.startDate &&
      dto.endDate &&
      new Date(dto.startDate) >= new Date(dto.endDate)
    ) {
      throw new BadRequestException(
        "La date de début doit être antérieure à la date de fin"
      );
    }

    // Validation des options
    if (!dto.options || dto.options.length < 2) {
      throw new BadRequestException("Un sondage doit avoir au moins 2 options");
    }

    // Validation des liens projet/tâche
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });
      if (!project) {
        throw new NotFoundException("Projet introuvable");
      }
    }

    if (dto.taskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: dto.taskId },
      });
      if (!task) {
        throw new NotFoundException("Tâche introuvable");
      }
    }

    // Création du sondage
    const surveyId = uuidv4();
    const now = new Date();

    const survey = new Survey(
      surveyId,
      dto.title,
      dto.description || null,
      dto.type,
      SurveyStatus.DRAFT,
      dto.voteType,
      dto.projectId || null,
      dto.taskId || null,
      dto.allowMultipleVotes || false,
      dto.isAnonymous || false,
      dto.maxVotesPerUser || null,
      dto.weightEnabled || false,
      dto.startDate ? new Date(dto.startDate) : null,
      dto.endDate ? new Date(dto.endDate) : null,
      creatorId,
      now,
      now
    );

    // Création des options
    const options = dto.options.map(
      (optionDto, index) =>
        new SurveyOption(
          uuidv4(),
          surveyId,
          optionDto.text,
          optionDto.description || null,
          optionDto.weight || null,
          optionDto.order || index,
          now
        )
    );

    // Sauvegarde en base
    await this.prisma.$transaction(async (tx) => {
      // Créer le sondage
      await tx.survey.create({
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

      // Créer les options
      await tx.surveyOption.createMany({
        data: options.map((option) => ({
          id: option.id,
          surveyId: option.surveyId,
          text: option.text,
          description: option.description,
          weight: option.weight,
          order: option.order,
          createdAt: option.createdAt,
        })),
      });
    });

    return survey;
  }
}
