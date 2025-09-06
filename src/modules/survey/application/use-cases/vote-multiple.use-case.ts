import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateMultipleVotesDto } from "../dto/vote.dto";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { VoteRepository } from "../../domain/interfaces/vote-repository.interface";
import { Vote } from "../../domain/entities/vote.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class VoteMultipleUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("SurveyOptionRepository")
    private readonly optionRepository: SurveyOptionRepository,
    @Inject("VoteRepository")
    private readonly voteRepository: VoteRepository
  ) {}

  async execute(
    surveyId: string,
    dto: CreateMultipleVotesDto,
    voterId: string
  ): Promise<Vote[]> {
    // Vérifier que le sondage existe
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    // Vérifier que le sondage est actif
    if (!survey.canVote()) {
      throw new BadRequestException("Ce sondage n'est plus actif");
    }

    // Vérifier que les votes multiples sont autorisés
    if (!survey.allowMultipleVotes) {
      throw new BadRequestException(
        "Les votes multiples ne sont pas autorisés pour ce sondage"
      );
    }

    // Vérifier que toutes les options existent
    const options = await Promise.all(
      dto.optionIds.map((optionId) => this.optionRepository.findById(optionId))
    );

    const invalidOptions = options.filter(
      (option, index) => !option || option.surveyId !== surveyId
    );

    if (invalidOptions.length > 0) {
      throw new NotFoundException("Une ou plusieurs options sont introuvables");
    }

    // Vérifier la limite de votes par utilisateur
    if (
      survey.maxVotesPerUser &&
      dto.optionIds.length > survey.maxVotesPerUser
    ) {
      throw new BadRequestException(
        `Limite de ${survey.maxVotesPerUser} votes dépassée`
      );
    }

    // Supprimer les votes existants de l'utilisateur pour ce sondage
    await this.voteRepository.deleteByVoterAndSurvey(voterId, surveyId);

    // Créer les nouveaux votes
    const votes = dto.optionIds.map(
      (optionId) =>
        new Vote(
          uuidv4(),
          surveyId,
          optionId,
          voterId,
          null, // Pas de poids pour les votes multiples
          dto.comment || null,
          dto.isAnonymous || survey.isAnonymous,
          new Date()
        )
    );

    return this.voteRepository.createMany(votes);
  }
}
