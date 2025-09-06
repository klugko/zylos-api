import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyResultsRepository } from "../../domain/interfaces/survey-results-repository.interface";
import { SurveyResultsResponseDto } from "../dto/survey-response.dto";

@Injectable()
export class GetSurveyResultsUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("SurveyResultsRepository")
    private readonly resultsRepository: SurveyResultsRepository
  ) {}

  async execute(surveyId: string): Promise<SurveyResultsResponseDto> {
    // Vérifier que le sondage existe
    const survey = await this.surveyRepository.findById(surveyId);
    if (!survey) {
      throw new NotFoundException("Sondage introuvable");
    }

    // Obtenir les résultats
    const results = await this.resultsRepository.getResults(surveyId);

    // Mapper vers le DTO de réponse
    const optionResults = results.optionResults.map((optionResult) => ({
      option: {
        id: optionResult.option.id,
        text: optionResult.option.text,
        description: optionResult.option.description,
        weight: optionResult.option.weight,
        order: optionResult.option.order,
        voteCount: optionResult.voteCount,
        totalWeight: optionResult.totalWeight,
        percentage: optionResult.percentage,
      },
      voteCount: optionResult.voteCount,
      totalWeight: optionResult.totalWeight,
      percentage: optionResult.percentage,
    }));

    const winner = results.getWinner();
    const hasConsensus = results.hasConsensus(0.6);

    return {
      surveyId: results.surveyId,
      totalVotes: results.totalVotes,
      uniqueVoters: results.uniqueVoters,
      participationRate: results.participationRate,
      isComplete: results.isComplete,
      optionResults,
      winner: winner
        ? {
            id: winner.option.id,
            text: winner.option.text,
            description: winner.option.description,
            weight: winner.option.weight,
            order: winner.option.order,
            voteCount: winner.voteCount,
            totalWeight: winner.totalWeight,
            percentage: winner.percentage,
          }
        : undefined,
      hasConsensus,
      consensusThreshold: 0.6,
    };
  }
}
