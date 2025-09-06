export class SurveyOption {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly text: string,
    public readonly description: string | null,
    public readonly weight: number | null,
    public readonly order: number,
    public readonly createdAt: Date
  ) {}

  public hasWeight(): boolean {
    return this.weight !== null && this.weight > 0;
  }

  public getDisplayText(): string {
    return this.description ? `${this.text} - ${this.description}` : this.text;
  }
}
