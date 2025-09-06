import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { SurveyResultsRepository } from "../../domain/interfaces/survey-results-repository.interface";
import {
  SurveyResults,
  OptionResult,
} from "../../domain/entities/survey-results.entity";
import { SurveyOption } from "../../domain/entities/survey-option.entity";
import { Vote } from "../../domain/entities/vote.entity";

@Injectable()
export class PrismaSurveyResultsRepository implements SurveyResultsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getResults(surveyId: string): Promise<SurveyResults> {
    const [votes, options, participationStats] = await Promise.all([
      this.prisma.vote.findMany({
        where: { surveyId },
        include: { option: true },
      }),
      this.prisma.surveyOption.findMany({
        where: { surveyId },
        orderBy: { order: "asc" },
      }),
      this.getParticipationStats(surveyId),
    ]);

    const totalVotes = votes.length;
    const uniqueVoters = participationStats.uniqueVoters;
    const participationRate = participationStats.participationRate;

    const optionResults = options.map((option) => {
      const optionVotes = votes.filter((vote) => vote.optionId === option.id);
      const voteCount = optionVotes.length;
      const totalWeight = optionVotes.reduce(
        (sum, vote) => sum + (vote.weight || 1),
        0
      );
      const percentage = totalVotes > 0 ? (totalWeight / totalVotes) * 100 : 0;

      return new OptionResult(
        new SurveyOption(
          option.id,
          option.surveyId,
          option.text,
          option.description,
          option.weight,
          option.order,
          option.createdAt
        ),
        voteCount,
        totalWeight,
        percentage,
        optionVotes.map(
          (vote) =>
            new Vote(
              vote.id,
              vote.surveyId,
              vote.optionId,
              vote.voterId,
              vote.weight,
              vote.comment,
              vote.isAnonymous,
              vote.createdAt
            )
        )
      );
    });

    return new SurveyResults(
      surveyId,
      totalVotes,
      uniqueVoters,
      optionResults,
      participationRate,
      true // isComplete
    );
  }

  async getResultsWithDetails(surveyId: string): Promise<SurveyResults> {
    return this.getResults(surveyId);
  }

  async getParticipationStats(surveyId: string): Promise<{
    totalVotes: number;
    uniqueVoters: number;
    participationRate: number;
  }> {
    const [totalVotes, uniqueVoters] = await Promise.all([
      this.prisma.vote.count({
        where: { surveyId },
      }),
      this.prisma.vote
        .groupBy({
          by: ["voterId"],
          where: { surveyId },
        })
        .then((result) => result.length),
    ]);

    // Calculer le taux de participation basé sur les membres du projet
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        project: {
          include: {
            members: true,
          },
        },
      },
    });

    const totalMembers = survey?.project?.members?.length || 1;
    const participationRate =
      totalMembers > 0 ? (uniqueVoters / totalMembers) * 100 : 0;

    return {
      totalVotes,
      uniqueVoters,
      participationRate,
    };
  }

  async getOptionStats(surveyId: string): Promise<
    {
      optionId: string;
      voteCount: number;
      totalWeight: number;
      percentage: number;
    }[]
  > {
    const [votes, totalVotes] = await Promise.all([
      this.prisma.vote.groupBy({
        by: ["optionId"],
        where: { surveyId },
        _count: { id: true },
        _sum: { weight: true },
      }),
      this.prisma.vote.count({
        where: { surveyId },
      }),
    ]);

    return votes.map((vote) => ({
      optionId: vote.optionId,
      voteCount: vote._count.id,
      totalWeight: vote._sum.weight || 0,
      percentage:
        totalVotes > 0 ? ((vote._sum.weight || 0) / totalVotes) * 100 : 0,
    }));
  }
}
