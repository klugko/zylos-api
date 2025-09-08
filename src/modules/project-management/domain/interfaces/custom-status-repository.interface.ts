import { CustomStatus } from "../entities/custom-status.entity";

export interface ICustomStatusRepository {
  create(customStatus: CustomStatus): Promise<CustomStatus>;
  findById(id: string): Promise<CustomStatus | null>;
  findByProjectId(projectId: string): Promise<CustomStatus[]>;
  findByProjectIdAndActive(projectId: string): Promise<CustomStatus[]>;
  update(customStatus: CustomStatus): Promise<CustomStatus>;
  delete(id: string): Promise<void>;
  findByNameAndProject(
    name: string,
    projectId: string
  ): Promise<CustomStatus | null>;
}
