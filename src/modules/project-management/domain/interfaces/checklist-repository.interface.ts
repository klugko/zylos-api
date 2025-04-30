import { Checklist } from '../entities/checklist.entity';


export interface ChecklistRepository {
  findById(id: string): Promise<Checklist | null>;
  findByProject(projectId: string): Promise<Checklist[]>;
  create(checklist: Checklist): Promise<Checklist>;
  update(checklist: Checklist): Promise<Checklist>;
  delete(id: string): Promise<void>;
}
