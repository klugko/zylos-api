import { ChecklistItem } from '../entities/checklist-item.entity';

export interface ChecklistItemRepository {
  findById(id: string): Promise<ChecklistItem | null>;
  findByTask(taskId: string): Promise<ChecklistItem[]>;
  create(item: ChecklistItem): Promise<ChecklistItem>;
  update(item: ChecklistItem): Promise<ChecklistItem>;
  delete(id: string): Promise<void>;
  bulkCreate(items: ChecklistItem[]): Promise<void>;
}
