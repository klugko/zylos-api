export interface IAIEstimationService {
    estimateFromData(data: any): Promise<{
      estimatedDuration: number;
      estimatedBudget: number;
      estimatedEndDate: Date;
    }>;
  }
  