export class ProjectChatMessage {
    constructor(
      public readonly id: string,
      public readonly projectId: string,
      public readonly senderId: string,
      public readonly content: string,
      public readonly createdAt: Date,
    ) {}
  
    static create(props: { id: string; projectId: string; senderId: string; content: string; createdAt?: Date }): ProjectChatMessage {
      return new ProjectChatMessage(
        props.id,
        props.projectId,
        props.senderId,
        props.content.trim(),
        props.createdAt ?? new Date(),
      );
    }
  }
  