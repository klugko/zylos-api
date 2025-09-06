import { Vote } from "../entities/vote.entity";

export interface VoteRepository {
  create(vote: Vote): Promise<Vote>;
  createMany(votes: Vote[]): Promise<Vote[]>;
  findBySurveyId(surveyId: string): Promise<Vote[]>;
  findByOptionId(optionId: string): Promise<Vote[]>;
  findByVoterId(voterId: string): Promise<Vote[]>;
  findBySurveyAndVoter(surveyId: string, voterId: string): Promise<Vote[]>;
  findBySurveyAndOption(surveyId: string, optionId: string): Promise<Vote[]>;
  findById(id: string): Promise<Vote | null>;
  update(id: string, data: Partial<Vote>): Promise<Vote>;
  delete(id: string): Promise<void>;
  deleteBySurveyId(surveyId: string): Promise<void>;
  deleteByVoterAndSurvey(voterId: string, surveyId: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  hasVoted(voterId: string, surveyId: string): Promise<boolean>;
  getVoteCount(surveyId: string): Promise<number>;
  getUniqueVoterCount(surveyId: string): Promise<number>;
}
