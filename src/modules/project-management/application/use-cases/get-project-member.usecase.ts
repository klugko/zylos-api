import { IProjectMemberRepository } from '@modules/project-management/domain/interfaces/project-member-repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProjectMemberDto } from '../dto/project-member-dto';


@Injectable()
export class GetProjectMembersUseCase {
  constructor(
    @Inject('IProjectMemberRepository')
    private readonly memberRepo: IProjectMemberRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectMemberDto[]> {
    const members = await this.memberRepo.findAllMembersByProject(projectId);

    if (!members.length) {
      return null;
    }

    return members.map((m) => ({
      id: m.id,
      projectId: m.projectId,
      userId: m.userId,
      role: m.role,
      fullname: m.fullname,
      email: m.email,
    }));
  }
}
