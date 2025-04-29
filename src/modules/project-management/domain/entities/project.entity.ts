export class Project {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public type: string,
    public isArchived: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  archive(): void {
    if (this.isArchived) {
      throw new Error('Project already archived');
    }
    this.isArchived = true;
  }
}
