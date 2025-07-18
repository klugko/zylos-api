import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IJitsiSessionRepository } from '../../domain/interfaces/jitsi-session.repository.interface';

@Injectable()
export class PrismaJitsiSessionRepository implements IJitsiSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async setMeetingUrl(projectId: string, meetingUrl: string): Promise<void> {
    await this.prisma.project.update({
      where: { id: projectId },
      data: { meetingUrl },
    });
  }

  async getMeetingUrl(projectId: string): Promise<string | null> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { meetingUrl: true },
    });
    return project?.meetingUrl || null;
  }
}
