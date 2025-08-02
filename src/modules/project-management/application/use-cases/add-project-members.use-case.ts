import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AddProjectMembersDto } from '../dto/add-project-members.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { IProjectMemberRepository } from '@modules/project-management/domain/interfaces/project-member-repository.interface';

@Injectable()
export class AddProjectMembersUseCase {
  constructor(
    @Inject('IProjectMemberRepository')
    private readonly memberRepo: IProjectMemberRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(dto: AddProjectMembersDto): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });

    if (!project) {
      return null;
    }

    await this.memberRepo.addMembersToProject(dto.projectId, dto.members);
  }
}
