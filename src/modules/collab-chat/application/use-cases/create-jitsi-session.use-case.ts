import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AccessControlService } from 'src/modules/collaboration/application/services/access-control.service';
import { CreateJitsiSessionDto } from '../dto/create-jitsi-session.dto';

@Injectable()
export class CreateJitsiSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessControl: AccessControlService,
  ) {}

  async execute(projectId: string, userId: string, dto: CreateJitsiSessionDto): Promise<{ meetingUrl: string }> {
    // Vérifie permission visio
    await this.accessControl.ensureProjectAccess(userId, projectId, 'validate'); 

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: { meetingUrl: dto.meetingUrl },
      select: { id: true, meetingUrl: true },
    });

    return { meetingUrl: updatedProject.meetingUrl! };
  }
}
