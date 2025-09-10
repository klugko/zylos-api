import { UpdateTaskColumnDto } from "../../application/dto/update-task-column.dto";
import { TaskColumn } from "../entities/task-column.entity";

export interface TaskColumnRepository {
  findByProjectId(projectId: string): Promise<TaskColumn[]>;
  findById(id: string): Promise<TaskColumn | null>;
  create(column: TaskColumn): Promise<TaskColumn>;
  update(id: string, dto: UpdateTaskColumnDto): Promise<TaskColumn>;
  updateOrder(id: string, order: number): Promise<TaskColumn>;
  delete(id: string): Promise<void>;
  hasTasks(id: string): Promise<boolean>;
}
