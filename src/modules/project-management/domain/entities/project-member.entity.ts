export class ProjectMember {
    constructor(
      public readonly id: string,
      public readonly projectId: string,
      public readonly userId: string,
      public readonly role: string,
      public readonly fullname: string,
      public readonly email: string,
    ) {}
  }
  