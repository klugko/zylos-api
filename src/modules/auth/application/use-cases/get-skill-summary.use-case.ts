import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserSkillRepository } from '../../infrastructure/repositories/user-skill.repository';
import { SkillScoringService, ScoredSkill } from '../../infrastructure/services/skill-scoring.service';
import { SkillSummaryResponseDto, ScoredSkillDto, FamilySummaryDto } from '../dto/skill-summary.dto';

@Injectable()
export class GetSkillSummaryUseCase {
  constructor(
    private readonly userSkillRepository: UserSkillRepository,
    private readonly skillScoringService: SkillScoringService,
  ) {}

  async execute(userId: string): Promise<SkillSummaryResponseDto> {
    const userSkills = await this.userSkillRepository.findByUserId(userId);
    
    if (userSkills.length === 0) {
      return {
        globalScore: 0,
        familyCount: 0,
        families: [],
      };
    }

    // Convertir les UserSkill en ScoredSkill
    const scoredSkills: ScoredSkill[] = userSkills.map(skill => ({
      name: skill.skill,
      family: 'other', // TODO: Récupérer la famille depuis la base ou recalculer
      weightedScore: skill.score,
      proficiency: skill.score, // Approximation
      experienceMonths: skill.yearsExperienceMonths,
      recencyFactor: 1.0, // TODO: Calculer basé sur lastUsedYear
      confidence: skill.confidence,
    }));

    // Calculer l'agrégation
    const aggregation = this.skillScoringService.aggregate(scoredSkills);

    // Convertir en DTOs
    const families: FamilySummaryDto[] = aggregation.families.map(family => ({
      family: family.family,
      score: family.score,
      topSkills: family.topSkills.map(skill => ({
        name: skill.name,
        family: skill.family,
        weightedScore: skill.weightedScore,
        proficiency: skill.proficiency,
        experienceMonths: skill.experienceMonths,
        recencyFactor: skill.recencyFactor,
        confidence: skill.confidence,
      })),
    }));

    return {
      globalScore: aggregation.globalScore,
      familyCount: aggregation.familyCount,
      families,
    };
  }
}
