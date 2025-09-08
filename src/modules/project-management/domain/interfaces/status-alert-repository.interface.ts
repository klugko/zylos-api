import { StatusAlert, AlertType } from "../entities/status-alert.entity";

export interface IStatusAlertRepository {
  create(statusAlert: StatusAlert): Promise<StatusAlert>;
  findByTaskId(taskId: string): Promise<StatusAlert[]>;
  findByProjectId(projectId: string): Promise<StatusAlert[]>;
  findUnresolvedByProjectId(projectId: string): Promise<StatusAlert[]>;
  findByType(type: AlertType): Promise<StatusAlert[]>;
  update(statusAlert: StatusAlert): Promise<StatusAlert>;
  resolve(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}
