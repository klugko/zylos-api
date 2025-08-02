import { AddProjectMemberDto } from "@modules/project-management/application/dto/add-project-members.dto";
import { ProjectMember } from "../entities/project-member.entity";

export interface IProjectMemberRepository {
  findAllMembersByProject(projectId: string): Promise<ProjectMember[]>;
  addMembersToProject(projectId: string, members: AddProjectMemberDto[]): Promise<void>;
}
