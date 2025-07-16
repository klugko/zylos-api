export class RoleEntity {
    constructor(
      public id: string,
      public name: string,
      public description?: string,
      public canRead = false,
      public canWrite = false,
      public canComment = false,
      public canValidate = false,
      public canDelete = false,
      public canUseVisio = false,
      public canUseDashboard = false,
    ) {}
  }
  