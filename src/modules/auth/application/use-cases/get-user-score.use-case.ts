import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UserScoreRepository } from '../../infrastructure/repositories/user-score.repository';
import { UserScoreResponseDto } from '../dto/user-score.dto';

@Injectable()
export class GetUserScoreUseCase {
  constructor(
    private readonly userScoreRepository: UserScoreRepository,
  ) {}

  async execute(userId: string): Promise<UserScoreResponseDto> {
    const userScore = await this.userScoreRepository.findByUserId(userId);
    
    if (!userScore) {
      // Retourner un score par défaut si aucun score n'existe
      return {
        score: 0,
        components: {
          emailVerified: 0,
          phoneVerified: 0,
          profileCompletion: 0,
          skills: 0,
          activity: 0,
          weights: {
            email: 0.2,
            phone: 0.2,
            profile: 0.2,
            skills: 0.3,
            activity: 0.1,
          },
        },
      };
    }

    return {
      score: userScore.overallScore,
      components: {
        emailVerified: userScore.emailScore,
        phoneVerified: userScore.phoneScore,
        profileCompletion: userScore.profileScore,
        skills: userScore.skillsScore,
        activity: userScore.activityScore,
        weights: {
          email: 0.2,
          phone: 0.2,
          profile: 0.2,
          skills: 0.3,
          activity: 0.1,
        },
      },
    };
  }
}
