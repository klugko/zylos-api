import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { VoteRepository } from "../../domain/interfaces/vote-repository.interface";

@Injectable()
export class DeleteSurveyUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("VoteRepository")
    private readonly voteRepository: VoteRepository
  ) {}

  async execute(surveyId: string, userId: string): Promise<void> {
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    // Vérifier que l'utilisateur est le créateur
    if (survey.creatorId !== userId) {
      throw new BadRequestException(
        "Vous n'êtes pas autorisé à supprimer ce sondage"
      );
    }

    // Vérifier que le sondage peut être supprimé (pas de votes ou statut DRAFT)
    const hasVotes = await this.voteRepository.getVoteCount(surveyId);
    if (hasVotes > 0 && survey.status !== "DRAFT") {
      throw new BadRequestException(
        "Impossible de supprimer un sondage qui a reçu des votes"
      );
    }

    await this.surveyRepository.delete(surveyId);
  }
}
