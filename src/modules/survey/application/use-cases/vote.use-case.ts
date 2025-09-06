import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateVoteDto } from "../dto/vote.dto";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { VoteRepository } from "../../domain/interfaces/vote-repository.interface";
import { Vote } from "../../domain/entities/vote.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class VoteUseCase {
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
    dto: CreateVoteDto,
    voterId: string
  ): Promise<Vote> {
    // Vérifier que le sondage existe
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    // Vérifier que le sondage est actif
    if (!survey.canVote()) {
      throw new BadRequestException("Ce sondage n'est plus actif");
    }

    // Vérifier que l'option existe
    const option = await this.optionRepository.findById(dto.optionId);
    if (!option || option.surveyId !== surveyId) {
      throw new NotFoundException("Option introuvable");
    }

    // Vérifier si l'utilisateur a déjà voté
    const hasVoted = await this.voteRepository.hasVoted(voterId, surveyId);
    if (hasVoted && !survey.allowMultipleVotes) {
      throw new BadRequestException("Vous avez déjà voté pour ce sondage");
    }

    // Vérifier la limite de votes par utilisateur
    if (survey.maxVotesPerUser) {
      const userVotes = await this.voteRepository.findBySurveyAndVoter(
        surveyId,
        voterId
      );
      if (userVotes.length >= survey.maxVotesPerUser) {
        throw new BadRequestException(
          `Limite de ${survey.maxVotesPerUser} votes atteinte`
        );
      }
    }

    // Validation du poids pour les votes pondérés
    if (survey.weightEnabled && dto.weight === undefined) {
      throw new BadRequestException("Un poids est requis pour ce sondage");
    }

    if (dto.weight !== undefined && (dto.weight < 0 || dto.weight > 10)) {
      throw new BadRequestException("Le poids doit être entre 0 et 10");
    }

    // Créer le vote
    const vote = new Vote(
      uuidv4(),
      surveyId,
      dto.optionId,
      voterId,
      dto.weight || null,
      dto.comment || null,
      dto.isAnonymous || survey.isAnonymous,
      new Date()
    );

    return this.voteRepository.create(vote);
  }
}
