import { ApiProperty } from '@nestjs/swagger';

export class ScoredSkillDto {
  @ApiProperty({ description: 'Nom de la compétence', example: 'Python' })
  name: string;

  @ApiProperty({ description: 'Famille de la compétence', example: 'programming_languages' })
  family: string;

  @ApiProperty({ description: 'Score pondéré (0-100)', example: 85.5 })
  weightedScore: number;

  @ApiProperty({ description: 'Niveau de maîtrise (0-100)', example: 80 })
  proficiency: number;

  @ApiProperty({ description: 'Mois d\'expérience', example: 42, required: false })
  experienceMonths?: number;

  @ApiProperty({ description: 'Facteur de récence', example: 0.95 })
  recencyFactor: number;

  @ApiProperty({ description: 'Niveau de confiance (0-100)', example: 90, required: false })
  confidence?: number;
}

export class FamilySummaryDto {
  @ApiProperty({ description: 'Famille de compétences', example: 'programming_languages' })
  family: string;

  @ApiProperty({ description: 'Score de la famille (0-100)', example: 82.3 })
  score: number;

  @ApiProperty({ description: 'Top compétences de la famille', type: [ScoredSkillDto] })
  topSkills: ScoredSkillDto[];
}

export class SkillSummaryResponseDto {
  @ApiProperty({ description: 'Score global des compétences (0-100)', example: 78.5 })
  globalScore: number;

  @ApiProperty({ description: 'Nombre de familles de compétences', example: 5 })
  familyCount: number;

  @ApiProperty({ description: 'Résumé par famille', type: [FamilySummaryDto] })
  families: FamilySummaryDto[];
}
