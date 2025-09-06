import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { SurveyOptionRepository } from "../../domain/interfaces/survey-option-repository.interface";
import { SurveyOption } from "../../domain/entities/survey-option.entity";

@Injectable()
export class PrismaSurveyOptionRepository implements SurveyOptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(option: SurveyOption): Promise<SurveyOption> {
    const created = await this.prisma.surveyOption.create({
      data: {
        id: option.id,
        surveyId: option.surveyId,
        text: option.text,
        description: option.description,
        weight: option.weight,
        order: option.order,
        createdAt: option.createdAt,
      },
    });

    return this.mapToEntity(created);
  }

  async createMany(options: SurveyOption[]): Promise<SurveyOption[]> {
    const created = await this.prisma.surveyOption.createMany({
      data: options.map((option) => ({
        id: option.id,
        surveyId: option.surveyId,
        text: option.text,
        description: option.description,
        weight: option.weight,
        order: option.order,
        createdAt: option.createdAt,
      })),
    });

    // Retourner les options créées (Prisma ne retourne pas les entités créées avec createMany)
    return options;
  }

  async findBySurveyId(surveyId: string): Promise<SurveyOption[]> {
    const options = await this.prisma.surveyOption.findMany({
      where: { surveyId },
      orderBy: { order: "asc" },
    });

    return options.map((option) => this.mapToEntity(option));
  }

  async findById(id: string): Promise<SurveyOption | null> {
    const option = await this.prisma.surveyOption.findUnique({
      where: { id },
    });

    return option ? this.mapToEntity(option) : null;
  }

  async update(id: string, data: Partial<SurveyOption>): Promise<SurveyOption> {
    const updated = await this.prisma.surveyOption.update({
      where: { id },
      data: {
        ...(data.text && { text: data.text }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.surveyOption.delete({
      where: { id },
    });
  }

  async deleteBySurveyId(surveyId: string): Promise<void> {
    await this.prisma.surveyOption.deleteMany({
      where: { surveyId },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.surveyOption.count({
      where: { id },
    });
    return count > 0;
  }

  private mapToEntity(data: any): SurveyOption {
    return new SurveyOption(
      data.id,
      data.surveyId,
      data.text,
      data.description,
      data.weight,
      data.order,
      data.createdAt
    );
  }
}
