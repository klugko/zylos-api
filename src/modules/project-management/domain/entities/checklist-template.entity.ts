export interface ChecklistTemplateProps {
    id: string;
    title: string;
    taskTemplateId: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export class ChecklistTemplate {
    private constructor(private readonly props: ChecklistTemplateProps) {}
  
    static create(props: ChecklistTemplateProps): ChecklistTemplate {
      return new ChecklistTemplate(props);
    }
  
    get id() {
      return this.props.id;
    }
  
    get title() {
      return this.props.title;
    }
  
    get taskTemplateId() {
      return this.props.taskTemplateId;
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
        taskTemplateId: this.taskTemplateId,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }
  }
  