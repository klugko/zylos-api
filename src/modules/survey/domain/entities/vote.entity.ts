export class Vote {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly optionId: string,
    public readonly voterId: string,
    public readonly weight: number | null,
    public readonly comment: string | null,
    public readonly isAnonymous: boolean,
    public readonly createdAt: Date
  ) {}

  public hasWeight(): boolean {
    return this.weight !== null && this.weight > 0;
  }

  public getEffectiveWeight(): number {
    return this.weight || 1;
  }

  public isFromUser(userId: string): boolean {
    return this.voterId === userId;
  }
}
