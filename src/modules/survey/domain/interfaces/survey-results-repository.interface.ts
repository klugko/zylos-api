import { SurveyResults } from "../entities/survey-results.entity";

export interface SurveyResultsRepository {
  getResults(surveyId: string): Promise<SurveyResults>;
  getResultsWithDetails(surveyId: string): Promise<SurveyResults>;
  getParticipationStats(surveyId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    participationRate: number;
  }>;
  getOptionStats(surveyId: string): Promise<
    {
      optionId: string;
      voteCount: number;
      totalWeight: number;
      percentage: number;
    }[]
  >;
}
