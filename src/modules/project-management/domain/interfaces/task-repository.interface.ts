import { Task } from '../entities/task.entity';


export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProject(projectId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  bulkCreate(tasks: Task[]): Promise<void>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  exists(taskId: string): Promise<boolean>;
  countByProject(projectId: string): Promise<number>;
  countByProjectAndStatus(projectId: string, status: string): Promise<number>;

}
