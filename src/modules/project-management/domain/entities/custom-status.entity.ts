export class CustomStatus {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string | null,
    public color: string,
    public order: number,
    public readonly projectId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public isActive: boolean = true,
    public isDefault: boolean = false
  ) {}

  updateDetails(name: string, description: string | null, color: string) {
    this.name = name;
    this.description = description;
    this.color = color;
  }

  deactivate() {
    this.isActive = false;
  }

  activate() {
    this.isActive = true;
  }
}
