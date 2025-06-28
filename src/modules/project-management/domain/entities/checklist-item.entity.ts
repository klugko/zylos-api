export class ChecklistItem {
    constructor(
      public readonly id: string,
      public title: string,
      public isChecked: boolean,
      public readonly taskId: string,
      public readonly createdAt: Date,
      public readonly updatedAt: Date
    ) {}
  
    toggle(): void {
      this.isChecked = !this.isChecked;
    }
  
    updateTitle(newTitle: string): void {
      this.title = newTitle;
    }
  
    markAsDone(): void {
      this.isChecked = true;
    }
  
    markAsUndone(): void {
      this.isChecked = false;
    }
  }
  