import { Task } from '../entities/task.entity';


export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProject(projectId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
}
