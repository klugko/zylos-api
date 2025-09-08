export class StatusDuration {
  constructor(
    public readonly id: string,
    public readonly taskId: string,
    public readonly customStatusId: string,
    public readonly projectId: string,
    public startDate: Date,
    public endDate: Date | null,
    public duration: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  complete(endDate: Date) {
    this.endDate = endDate;
    this.duration = endDate.getTime() - this.startDate.getTime();
  }

  getDurationInDays(): number {
    if (this.endDate) {
      return Math.ceil(this.duration / (1000 * 60 * 60 * 24));
    }
    return Math.ceil(
      (Date.now() - this.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}
