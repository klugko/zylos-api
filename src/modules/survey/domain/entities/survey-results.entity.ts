import { SurveyOption } from "./survey-option.entity";
import { Vote } from "./vote.entity";

export class SurveyResults {
  constructor(
    public readonly surveyId: string,
    public readonly totalVotes: number,
    public readonly uniqueVoters: number,
    public readonly optionResults: OptionResult[],
    public readonly participationRate: number,
    public readonly isComplete: boolean
  ) {}

  public getWinner(): OptionResult | null {
    if (this.optionResults.length === 0) return null;

    return this.optionResults.reduce((winner, current) =>
      current.totalWeight > winner.totalWeight ? current : winner
    );
  }

  public getTopOptions(limit: number = 3): OptionResult[] {
    return this.optionResults
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .slice(0, limit);
  }

  public hasConsensus(threshold: number = 0.6): boolean {
    const winner = this.getWinner();
    if (!winner) return false;

    return winner.totalWeight / this.totalVotes >= threshold;
  }
}

export class OptionResult {
  constructor(
    public readonly option: SurveyOption,
    public readonly voteCount: number,
    public readonly totalWeight: number,
    public readonly percentage: number,
    public readonly votes: Vote[]
  ) {}

  public getAverageWeight(): number {
    return this.voteCount > 0 ? this.totalWeight / this.voteCount : 0;
  }
}
