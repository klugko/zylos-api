export enum MessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT'
}

export class AiMessage {
  constructor(
    public readonly id: string,
    public readonly conversationId: string,
    public readonly role: MessageRole,
    public readonly content: string,
    public readonly createdAt: Date
  ) {}
}

export class AiConversation {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public messages: AiMessage[] = []
  ) {}

  addMessage(role: MessageRole, content: string): AiMessage {
    const message = new AiMessage(
      '',
      this.id,
      role,
      content,
      new Date()
    );
    this.messages.push(message);
    this.updatedAt = new Date();
    return message;
  }

  updateTitle(newTitle: string): void {
    this.title = newTitle;
    this.updatedAt = new Date();
  }

  getLastMessage(): AiMessage | null {
    return this.messages.length > 0 ? this.messages[this.messages.length - 1] : null;
  }

  getMessageCount(): number {
    return this.messages.length;
  }
}
