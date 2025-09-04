import { UserRole } from "../enums/user-role.enum";

export class Invitation {
  constructor(
    public readonly id: string,
    public email: string,
    public token: string,
    public projectId: string | null,
    public role: UserRole,
    public expiresAt: Date,
    public accepted: boolean,
    public readonly createdAt: Date,
  ) {}

  isExpired(): boolean {
    return this.expiresAt.getTime() < Date.now();
  }

  accept(): void {
    if (this.isExpired()) {
      throw new Error('Invitation expirée');
    }
    if (this.accepted) {
      throw new Error('Invitation déjà acceptée');
    }
    this.accepted = true;
  }
}
