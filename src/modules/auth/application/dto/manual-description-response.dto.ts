import { ApiProperty } from '@nestjs/swagger';

export class ManualDescriptionSuccessResponseDto {
  @ApiProperty({ description: 'Indique si l\'analyse a réussi' })
  success: true;

  @ApiProperty({ description: 'Message de confirmation' })
  message: string;

  @ApiProperty({ 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        category: { type: 'string' },
        proficiency: { type: 'number' },
        monthsExperience: { type: 'number' },
        seniority: { type: 'string' },
        confidence: { type: 'number' },
        lastUsedYear: { type: 'number' }
      }
    },
    description: 'Compétences extraites et analysées'
  })
  skills: Array<{
    name: string;
    category: string;
    proficiency: number;
    monthsExperience: number;
    seniority: string;
    confidence: number;
    lastUsedYear: number;
  }>;

  @ApiProperty({ description: 'Disponibilité calculée (0-100)' })
  availability: number;

  @ApiProperty({ description: 'Score de performance calculé (0-100)' })
  performanceScore: number;

  @ApiProperty({ description: 'Nombre de nouvelles compétences ajoutées' })
  newSkills: number;

  @ApiProperty({ description: 'Nombre total de compétences après fusion' })
  totalSkills: number;

  @ApiProperty({ 
    description: 'Détails du scoring'
  })
  scoring: {
    skillScores: any[];
    userScore: any;
    skillAggregation: any;
  };
}

export class ManualDescriptionErrorResponseDto {
  @ApiProperty({ description: 'Indique si l\'analyse a échoué' })
  success: false;

  @ApiProperty({ description: 'Message d\'erreur généré par l\'IA' })
  message: string;

  @ApiProperty({ 
    type: 'array',
    items: { type: 'string' },
    description: 'Liste des éléments manquants dans la description'
  })
  missingElements: string[];

  @ApiProperty({ 
    example: 'Veuillez inclure plus de détails sur vos compétences techniques, votre expérience professionnelle, et votre disponibilité horaire.',
    description: 'Suggestion d\'amélioration générée par l\'IA'
  })
  suggestion: string;
}
