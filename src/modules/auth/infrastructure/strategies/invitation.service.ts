import { Injectable } from '@nestjs/common';
import { InvitationRepositoryPrisma } from '../repositories/prisma-invitation.repository';
import { InvitationMailService } from './invitation-mail.service';
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';

@Injectable()
export class InvitationService {
  constructor(
    private readonly repo: InvitationRepositoryPrisma,
    private readonly mailService: InvitationMailService,
  ) {}

  async createInvitation(email: string, projectId: string, role: UserRole, invitedBy: string, projectName: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

    const invitation = await this.repo.create(email, projectId, role, token, expiresAt);

    await this.mailService.sendInvitationEmail(email, token, invitedBy, projectName);

    return invitation;
  }
}
