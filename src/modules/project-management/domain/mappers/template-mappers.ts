import { TaskTemplate } from '../entities/task-template.entity';

export function taskTemplateToJson(task: TaskTemplate) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    order: task.order,
    projectTemplateId: task.projectTemplateId,
    checklists: task.checklists.map(c => ({
      id: c.id,
      title: c.title,
      taskTemplateId: c.taskTemplateId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
