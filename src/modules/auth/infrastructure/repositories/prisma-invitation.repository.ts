import { PrismaService } from '@core/prisma/prisma.service';
import { Invitation } from '@modules/auth/domain/entities/invitation.entity';
import { UserRole } from '@modules/auth/domain/enums/user-role.enum';
import { IInvitationRepository } from '@modules/auth/domain/interfaces/invitation.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class InvitationRepositoryPrisma implements IInvitationRepository {
  constructor(private prisma: PrismaService) {}

  private mapToEntity(data: any): Invitation {
    return new Invitation(
      data.id,
      data.email,
      data.token,
      data.projectId,
      data.role as UserRole,
      data.expiresAt,
      data.accepted,
      data.createdAt,
    );
  }

  async create(
    email: string,
    projectId: string | null,
    role: UserRole,
    token: string,
    expiresAt: Date
  ): Promise<Invitation> {
    let validProjectId: string | null = null;

    if (projectId) {
      const projectExists = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (projectExists) {
        validProjectId = projectId;
      } else {
        console.warn(`Project with id "${projectId}" does not exist. Invitation will be created without project.`);
      }
    }

    const invitation = await this.prisma.invitation.create({
      data: { email, projectId: validProjectId, role, token, expiresAt },
    });

    return this.mapToEntity(invitation);
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const invitation = await this.prisma.invitation.findUnique({ where: { token } });
    return invitation ? this.mapToEntity(invitation) : null;
  }

  async markAsAccepted(token: string): Promise<Invitation> {
    const invitation = await this.prisma.invitation.update({
      where: { token },
      data: { accepted: true },
    });
    return this.mapToEntity(invitation);
  }
}
