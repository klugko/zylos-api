import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UpdateSurveyDto } from "../dto/update-survey.dto";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { Survey } from "../../domain/entities/survey.entity";
import { SurveyStatus } from "../../domain/enums/survey.enums";

@Injectable()
export class UpdateSurveyUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("SurveyOptionRepository")
    private readonly optionRepository: SurveyOptionRepository
  ) {}

  async execute(
    surveyId: string,
    dto: UpdateSurveyDto,
    userId: string
  ): Promise<Survey> {
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    // Vérifier que l'utilisateur est le créateur
    if (survey.creatorId !== userId) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à modifier ce sondage"
      );
    }

    // Vérifier que le sondage peut être modifié
    if (!survey.canBeModified()) {
      throw new BadRequestException("Ce sondage ne peut plus être modifié");
    }

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

    // Mise à jour du sondage
    const updatedSurvey = await this.surveyRepository.update(surveyId, {
      ...(dto.title && { title: dto.title }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.type && { type: dto.type }),
      ...(dto.status && { status: dto.status }),
      ...(dto.voteType && { voteType: dto.voteType }),
      ...(dto.projectId !== undefined && { projectId: dto.projectId }),
      ...(dto.taskId !== undefined && { taskId: dto.taskId }),
      ...(dto.allowMultipleVotes !== undefined && {
        allowMultipleVotes: dto.allowMultipleVotes,
      }),
      ...(dto.isAnonymous !== undefined && { isAnonymous: dto.isAnonymous }),
      ...(dto.maxVotesPerUser !== undefined && {
        maxVotesPerUser: dto.maxVotesPerUser,
      }),
      ...(dto.weightEnabled !== undefined && {
        weightEnabled: dto.weightEnabled,
      }),
      ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
    });

    return updatedSurvey;
  }
}
