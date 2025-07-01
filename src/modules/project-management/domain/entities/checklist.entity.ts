export class Checklist {
  constructor(
    public readonly id: string,
    public title: string,
    public isCompleted: boolean, // Ajouté
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly taskId?: string
  ) {}

  toggle(): void {
    this.isCompleted = !this.isCompleted;
  }
}


