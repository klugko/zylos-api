import {
  SurveyType,
  SurveyStatus,
  VoteType,
} from "../../domain/enums/survey.enums";

export class SurveyOptionResponseDto {
  id: string;
  text: string;
  description?: string;
  weight?: number;
  order: number;
  voteCount?: number;
  totalWeight?: number;
  percentage?: number;
}

export class SurveyResponseDto {
  id: string;
  title: string;
  description?: string;
  type: SurveyType;
  status: SurveyStatus;
  voteType: VoteType;
  projectId?: string;
  taskId?: string;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  maxVotesPerUser?: number;
  weightEnabled: boolean;
  startDate?: Date;
  endDate?: Date;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  options: SurveyOptionResponseDto[];
  totalVotes?: number;
  uniqueVoters?: number;
  participationRate?: number;
  canVote?: boolean;
  isActive?: boolean;
  isExpired?: boolean;
}

export class VoteResponseDto {
  id: string;
  optionId: string;
  voterId?: string; // Masqué si anonyme
  weight?: number;
  comment?: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export class SurveyResultsResponseDto {
  surveyId: string;
  totalVotes: number;
  uniqueVoters: number;
  participationRate: number;
  isComplete: boolean;
  optionResults: {
    option: SurveyOptionResponseDto;
    voteCount: number;
    totalWeight: number;
    percentage: number;
  }[];
  winner?: SurveyOptionResponseDto;
  hasConsensus: boolean;
  consensusThreshold: number;
}
