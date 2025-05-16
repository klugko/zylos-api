import { taskTemplateToJson } from '../mappers/template-mappers';
import { TaskTemplate } from './task-template.entity';


export interface ProjectTemplateProps {
  id: string;
  name: string;
  description?: string;
  tasks: TaskTemplate[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectTemplate {
  private constructor(private readonly props: ProjectTemplateProps) {}

  static create(props: ProjectTemplateProps): ProjectTemplate {
    return new ProjectTemplate(props);
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get tasks() {
    return this.props.tasks;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      tasks: this.tasks.map(taskTemplateToJson),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
  
}
