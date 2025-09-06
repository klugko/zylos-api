import { Survey } from "../entities/survey.entity";
import { GetSurveysDto } from "../../application/dto/survey-query.dto";

export interface SurveyRepository {
  create(survey: Survey): Promise<Survey>;
  findById(id: string): Promise<Survey | null>;
  findByProjectId(projectId: string): Promise<Survey[]>;
  findByTaskId(taskId: string): Promise<Survey[]>;
  findByCreatorId(creatorId: string): Promise<Survey[]>;
  findMany(query: GetSurveysDto): Promise<{ surveys: Survey[]; total: number }>;
  update(id: string, data: Partial<Survey>): Promise<Survey>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
