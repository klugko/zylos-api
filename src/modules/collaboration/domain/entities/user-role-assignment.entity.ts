export class UserRoleAssignmentEntity {
    constructor(
      public id: string,
      public userId: string,
      public roleId: string,
      public projectId?: string,
    ) {}
  }
  