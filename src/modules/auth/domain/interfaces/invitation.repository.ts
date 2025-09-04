import { Invitation } from "../entities/invitation.entity";
import { UserRole } from "../enums/user-role.enum";

export interface IInvitationRepository {
  create(email: string, projectId: string | null, role: UserRole, token: string, expiresAt: Date): Promise<Invitation>;
  findByToken(token: string): Promise<Invitation | null>;
  markAsAccepted(token: string): Promise<Invitation>;
}
