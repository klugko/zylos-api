import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AccessControlService } from 'src/modules/collaboration/application/services/access-control.service';

@Injectable()
export class GetJitsiSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  async execute(projectId: string, userId: string): Promise<{ meetingUrl: string }> {
    // Vérifie permission lecture
    await this.accessControl.ensureProjectAccess(userId, projectId, 'read');

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { meetingUrl: true },
    });

    if (!project) throw new NotFoundException('Projet introuvable');
    if (!project.meetingUrl) throw new NotFoundException('Aucun lien de visio configuré');

    return { meetingUrl: project.meetingUrl };
  }
}
