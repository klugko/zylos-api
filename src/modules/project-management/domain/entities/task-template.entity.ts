import { ChecklistTemplate } from "./checklist-template.entity";


export interface TaskTemplateProps {
  id: string;
  title: string;
  description?: string;
  order: number;
  projectTemplateId: string;
  checklists: ChecklistTemplate[];
  createdAt: Date;
  updatedAt: Date;
}

export class TaskTemplate {
  private constructor(private readonly props: TaskTemplateProps) {}

  static create(props: TaskTemplateProps): TaskTemplate {
    return new TaskTemplate(props);
  }

  get id() {
    return this.props.id;
  }

  get title() {
    return this.props.title;
  }

  get description() {
    return this.props.description;
  }

  get order() {
    return this.props.order;
  }

  get projectTemplateId() {
    return this.props.projectTemplateId;
  }

  get checklists() {
    return this.props.checklists;
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
      title: this.title,
      description: this.description,
      order: this.order,
      projectTemplateId: this.projectTemplateId,
      checklists: this.checklists.map(c => c.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
