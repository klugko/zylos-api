import { ProjectTemplate } from '../entities/project-template.entity';

export interface ProjectTemplateRepository {
  findByIdWithTasks(templateId: string): Promise<ProjectTemplate | null>;
}
