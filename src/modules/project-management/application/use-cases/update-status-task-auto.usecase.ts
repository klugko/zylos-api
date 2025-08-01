import { Inject, Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/interfaces/task-repository.interface';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { TaskStatus } from '../../domain/enums/task.enums';

@Injectable()
export class UpdateTaskStatusFromChecklistUseCase {
  constructor(
    @Inject('ChecklistRepository') private readonly checklistRepo: ChecklistRepository,
    @Inject('TaskRepository') private readonly taskRepo: TaskRepository,
  ) {}

  async execute(taskId: string): Promise<void> {
    const checklists = await this.checklistRepo.findByTask(taskId);

    if (!checklists.length) return;

    const allDone = checklists.every(c => c.status === 'DONE');

    const task = await this.taskRepo.findById(taskId);
    if (!task) return;

    const shouldUpdate = allDone && task.status !== TaskStatus.DONE;
    if (shouldUpdate) {
      task.updateStatus(TaskStatus.DONE);
      await this.taskRepo.update(task);
    }
  }
}
