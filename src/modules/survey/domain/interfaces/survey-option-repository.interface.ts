import { SurveyOption } from "../entities/survey-option.entity";

export interface SurveyOptionRepository {
  create(option: SurveyOption): Promise<SurveyOption>;
  createMany(options: SurveyOption[]): Promise<SurveyOption[]>;
  findBySurveyId(surveyId: string): Promise<SurveyOption[]>;
  findById(id: string): Promise<SurveyOption | null>;
  update(id: string, data: Partial<SurveyOption>): Promise<SurveyOption>;
  delete(id: string): Promise<void>;
  deleteBySurveyId(surveyId: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
