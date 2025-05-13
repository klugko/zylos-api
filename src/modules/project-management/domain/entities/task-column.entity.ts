export class TaskColumn {
    constructor(
      public readonly id: string,
      public name: string,
      public order: number,
      public projectId: string,
    ) {}
  }
  