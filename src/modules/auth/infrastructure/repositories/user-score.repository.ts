import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';

export interface UserScore {
  id: string;
  userId: string;
  overallScore: number;
  emailScore: number;
  phoneScore: number;
  profileScore: number;
  skillsScore: number;
  activityScore: number;
  skillsCount: number;
  skillsGlobalScore: number;
  profileCompletion: number;
  updatedAt: Date;
}

@Injectable()
export class UserScoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserScore | null> {
    const userScore = await this.prisma.userScore.findUnique({
      where: { userId },
    });

    if (!userScore) {
      return null;
    }

    return {
      id: userScore.id,
      userId: userScore.userId,
      overallScore: userScore.overallScore,
      emailScore: userScore.emailScore,
      phoneScore: userScore.phoneScore,
      profileScore: userScore.profileScore,
      skillsScore: userScore.skillsScore,
      activityScore: userScore.activityScore,
      skillsCount: userScore.skillsCount,
      skillsGlobalScore: userScore.skillsGlobalScore,
      profileCompletion: userScore.profileCompletion,
      updatedAt: userScore.updatedAt,
    };
  }

  async upsert(
    userId: string,
    overallScore: number,
    emailScore: number,
    phoneScore: number,
    profileScore: number,
    skillsScore: number,
    activityScore: number,
    skillsCount: number,
    skillsGlobalScore: number,
    profileCompletion: number,
  ): Promise<UserScore> {
    const userScore = await this.prisma.userScore.upsert({
      where: { userId },
      update: {
        overallScore,
        emailScore,
        phoneScore,
        profileScore,
        skillsScore,
        activityScore,
        skillsCount,
        skillsGlobalScore,
        profileCompletion,
        updatedAt: new Date(),
      },
      create: {
        userId,
        overallScore,
        emailScore,
        phoneScore,
        profileScore,
        skillsScore,
        activityScore,
        skillsCount,
        skillsGlobalScore,
        profileCompletion,
      },
    });

    return {
      id: userScore.id,
      userId: userScore.userId,
      overallScore: userScore.overallScore,
      emailScore: userScore.emailScore,
      phoneScore: userScore.phoneScore,
      profileScore: userScore.profileScore,
      skillsScore: userScore.skillsScore,
      activityScore: userScore.activityScore,
      skillsCount: userScore.skillsCount,
      skillsGlobalScore: userScore.skillsGlobalScore,
      profileCompletion: userScore.profileCompletion,
      updatedAt: userScore.updatedAt,
    };
  }
}
