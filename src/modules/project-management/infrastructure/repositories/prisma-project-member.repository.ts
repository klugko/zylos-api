import { ProjectMember } from '@modules/project-management/domain/entities/project-member.entity';
import { IProjectMemberRepository } from '@modules/project-management/domain/interfaces/project-member-repository.interface';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class PrismaProjectMemberRepository implements IProjectMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllMembersByProject(projectId: string): Promise<ProjectMember[]> {
    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: true },
    });

    return members.map((m) => new ProjectMember(
      m.id,
      m.projectId,
      m.userId,
      m.role,
      m.user.fullname,
      m.user.email,
    ));
  }
}
