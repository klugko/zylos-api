import { UpdateTaskColumnDto } from '../../application/dto/update-task-column.dto';
import { TaskColumn } from '../entities/task-column.entity';


export interface TaskColumnRepository {
  findByProjectId(projectId: string): Promise<TaskColumn[]>;
  create(column: TaskColumn): Promise<TaskColumn>;
  update(id: string, dto: UpdateTaskColumnDto): Promise<TaskColumn>;
  updateOrder(id: string, order: number): Promise<TaskColumn>;
}
