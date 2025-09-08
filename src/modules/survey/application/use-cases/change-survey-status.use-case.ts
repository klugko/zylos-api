import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyStatus } from "../../domain/enums/survey.enums";

@Injectable()
export class ChangeSurveyStatusUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository
  ) {}

  async execute(
    surveyId: string,
    status: SurveyStatus,
    userId: string
  ): Promise<void> {
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    if (survey.creatorId !== userId) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à modifier ce sondage"
      );
    }

    switch (status) {
      case SurveyStatus.ACTIVE:
        if (survey.status !== SurveyStatus.DRAFT) {
          throw new BadRequestException(
            "Seuls les sondages en brouillon peuvent être activés"
          );
        }
        break;

      case SurveyStatus.CLOSED:
        if (survey.status !== SurveyStatus.ACTIVE) {
          throw new BadRequestException(
            "Seuls les sondages actifs peuvent être fermés"
          );
        }
        break;

      case SurveyStatus.ARCHIVED:
        if (survey.status !== SurveyStatus.CLOSED) {
          throw new BadRequestException(
            "Seuls les sondages fermés peuvent être archivés"
          );
        }
        break;

      case SurveyStatus.DRAFT:
        if (survey.status !== SurveyStatus.ACTIVE) {
          throw new BadRequestException("Impossible de revenir en brouillon");
        }
        break;
    }

    await this.surveyRepository.update(surveyId, { status });
  }
}
