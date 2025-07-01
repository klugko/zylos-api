export interface IOpenAIAIService {
    generateTasksAndChecklists(
      projectName: string,
      projectDescription: string
    ): Promise<{
      title: string;
      description: string;
      tasks: {
        title: string;
        description: string;
        status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
        priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
        estimatedTime: number;
        checklist: string[];
      }[];
    }>;
  }
  