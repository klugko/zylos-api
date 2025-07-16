export class Partner {
    constructor(
      public id: string,
      public email: string,
      public fullname: string,
      public partnerType?: string,
      public external = true,
      public activationToken?: string,
    ) {}
  }
  