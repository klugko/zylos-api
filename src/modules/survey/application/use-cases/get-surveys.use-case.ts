import { Injectable, Inject } from "@nestjs/common";
import { SurveyRepository } from "../../domain/interfaces/survey-repository.interface";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { VoteRepository } from "../../domain/interfaces/vote-repository.interface";
import { GetSurveysDto } from "../dto/survey-query.dto";
import { SurveyResponseDto } from "../dto/survey-response.dto";

@Injectable()
export class GetSurveysUseCase {
  constructor(
    @Inject("SurveyRepository")
    private readonly surveyRepository: SurveyRepository,
    @Inject("SurveyOptionRepository")
    private readonly optionRepository: SurveyOptionRepository,
    @Inject("VoteRepository")
    private readonly voteRepository: VoteRepository
  ) {}

  async execute(
    query: GetSurveysDto
  ): Promise<{ surveys: SurveyResponseDto[]; total: number }> {
    const { surveys, total } = await this.surveyRepository.findMany(query);

    const surveysWithDetails = await Promise.all(
      surveys.map(async (survey) => {
        const [options, totalVotes, uniqueVoters] = await Promise.all([
          this.optionRepository.findBySurveyId(survey.id),
          this.voteRepository.getVoteCount(survey.id),
          this.voteRepository.getUniqueVoterCount(survey.id),
        ]);

        const optionsWithStats = await Promise.all(
          options.map(async (option) => {
            const optionVotes = await this.voteRepository.findBySurveyAndOption(
              survey.id,
              option.id
            );
            const voteCount = optionVotes.length;
            const totalWeight = optionVotes.reduce(
              (sum, vote) => sum + vote.getEffectiveWeight(),
              0
            );
            const percentage =
              totalVotes > 0 ? (totalWeight / totalVotes) * 100 : 0;

            return {
              id: option.id,
              text: option.text,
              description: option.description,
              weight: option.weight,
              order: option.order,
              voteCount,
              totalWeight,
              percentage,
            };
          })
        );

        return {
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
          options: optionsWithStats,
          totalVotes,
          uniqueVoters,
          participationRate: 0, // Calculé ailleurs
          canVote: survey.canVote(),
          isActive: survey.isActive(),
          isExpired: survey.isExpired(),
        };
      })
    );

    return { surveys: surveysWithDetails, total };
  }
}
