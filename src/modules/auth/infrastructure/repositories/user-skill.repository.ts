import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export interface UserSkill {
  id: string;
  userId: string;
  skill: string;
  score: number;
  category?: string;
  yearsExperienceMonths?: number;
  seniority?: string;
  confidence?: number;
  lastUsedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserSkillRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertBulk(
    userId: string,
    skills: Array<{
      name: string;
      score: number;
      category?: string;
      yearsExperienceMonths?: number;
      seniority?: string;
      confidence?: number;
      lastUsedYear?: number;
    }>
  ): Promise<void> {
    // Supprimer les compétences existantes
    await this.prisma.userSkill.deleteMany({
      where: { userId },
    });

    // Insérer les nouvelles compétences
    if (skills.length > 0) {
      await this.prisma.userSkill.createMany({
        data: skills.map(skill => ({
          userId,
          skill: skill.name,
          score: skill.score,
          category: skill.category,
          yearsExperienceMonths: skill.yearsExperienceMonths,
          seniority: skill.seniority,
          confidence: skill.confidence,
          lastUsedYear: skill.lastUsedYear,
        })),
      });
    }
  }

  async findByUserId(userId: string): Promise<UserSkill[]> {
    const skills = await this.prisma.userSkill.findMany({
      where: { userId },
      orderBy: [
        { score: 'desc' },
        { confidence: 'desc' },
        { skill: 'asc' },
      ],
    });

    return skills.map(skill => ({
      id: skill.id,
      userId: skill.userId,
      skill: skill.skill,
      score: skill.score,
      category: skill.category,
      yearsExperienceMonths: skill.yearsExperienceMonths,
      seniority: skill.seniority,
      confidence: skill.confidence,
      lastUsedYear: skill.lastUsedYear,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
    }));
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.userSkill.count({
      where: { userId },
    });
  }
}
