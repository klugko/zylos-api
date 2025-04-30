export class Checklist {
  constructor(
    public readonly id: string,
    public title: string,
    public completed: boolean,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  toggle(): void {
    this.completed = !this.completed;
  }
}
