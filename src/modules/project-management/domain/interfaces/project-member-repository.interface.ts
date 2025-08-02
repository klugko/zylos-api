import { ProjectMember } from "../entities/project-member.entity";

export interface IProjectMemberRepository {
  findAllMembersByProject(projectId: string): Promise<ProjectMember[]>;
}
