import { Task } from '../entities/task.entity';
import { TaskStatus } from '../enums/task.enums';


export interface TaskRepository {
  findById(id: string): Promise<Task | null>;
  findByProject(projectId: string): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  bulkCreate(tasks: Task[]): Promise<void>;
  update(task: Task): Promise<Task>;
  updateFull(id: string, data: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  exists(taskId: string): Promise<boolean>;
  countByProject(projectId: string): Promise<number>;
  countByProjectAndStatus(projectId: string, status: string): Promise<number>;
  findByStatusAndEndDateBefore(statuses: TaskStatus[], date: Date): Promise<Task[]>;
  findByStatusAndEndDateBetween(statuses: TaskStatus[], from: Date, to: Date): Promise<Task[]>;
  findIdleTasksWithoutStartDate(before: Date): Promise<Task[]>;
  findByUserAndEndDateBefore(userId: string, before: Date): Promise<Task[]>;
  findByUserAndEndDateBetween(userId: string, start: Date, end: Date): Promise<Task[]>;
  findUserIdleTasks(userId: string, referenceDate: Date): Promise<Task[]>;

  
}
