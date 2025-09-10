import { ApiProperty } from '@nestjs/swagger';

export class UserScoreResponseDto {
  @ApiProperty({ description: 'Score utilisateur (0-100)', example: 85 })
  score: number;

  @ApiProperty({
    description: 'Composants du score',
    example: {
      emailVerified: 100,
      phoneVerified: 0,
      profileCompletion: 80,
      skills: 90,
      activity: 75,
      weights: {
        email: 0.2,
        phone: 0.2,
        profile: 0.2,
        skills: 0.3,
        activity: 0.1,
      },
    },
  })
  components: {
    emailVerified: number;
    phoneVerified: number;
    profileCompletion: number;
    skills: number;
    activity: number;
    weights: {
      email: number;
      phone: number;
      profile: number;
      skills: number;
      activity: number;
    };
  };
}

export class AdminRecomputeScoreResponseDto {
  @ApiProperty({ description: 'Score utilisateur recalculé (0-100)', example: 87 })
  score: number;

  @ApiProperty({ description: 'Date de mise à jour', example: '2025-09-10T12:30:00Z' })
  updatedAt: string;

  @ApiProperty({
    description: 'Composants du score',
    example: {
      emailVerified: 100,
      phoneVerified: 0,
      profileCompletion: 80,
      skills: 90,
      activity: 75,
      weights: {
        email: 0.2,
        phone: 0.2,
        profile: 0.2,
        skills: 0.3,
        activity: 0.1,
      },
    },
  })
  components: {
    emailVerified: number;
    phoneVerified: number;
    profileCompletion: number;
    skills: number;
    activity: number;
    weights: {
      email: number;
      phone: number;
      profile: number;
      skills: number;
      activity: number;
    };
  };
}
