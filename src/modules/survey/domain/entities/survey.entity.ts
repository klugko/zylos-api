import { SurveyType, SurveyStatus, VoteType } from "../enums/survey.enums";

export class Survey {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly type: SurveyType,
    public readonly status: SurveyStatus,
    public readonly voteType: VoteType,
    public readonly projectId: string | null,
    public readonly taskId: string | null,
    public readonly allowMultipleVotes: boolean,
    public readonly isAnonymous: boolean,
    public readonly maxVotesPerUser: number | null,
    public readonly weightEnabled: boolean,
    public readonly startDate: Date | null,
    public readonly endDate: Date | null,
    public readonly creatorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public isActive(): boolean {
    const now = new Date();
    const isStatusActive = this.status === SurveyStatus.ACTIVE;
    const isWithinTimeframe =
      (!this.startDate || this.startDate <= now) &&
      (!this.endDate || this.endDate >= now);
    return isStatusActive && isWithinTimeframe;
  }

  public canVote(): boolean {
    return this.isActive();
  }

  public isExpired(): boolean {
    return this.endDate ? this.endDate < new Date() : false;
  }

  public canBeModified(): boolean {
    return this.status === SurveyStatus.DRAFT;
  }

  public canBeClosed(): boolean {
    return this.status === SurveyStatus.ACTIVE;
  }

  public canBeArchived(): boolean {
    return this.status === SurveyStatus.CLOSED;
  }
}
