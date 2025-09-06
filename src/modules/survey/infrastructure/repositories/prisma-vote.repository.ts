import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { VoteRepository } from "../../domain/interfaces/vote-repository.interface";
import { Vote } from "../../domain/entities/vote.entity";

@Injectable()
export class PrismaVoteRepository implements VoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(vote: Vote): Promise<Vote> {
    const created = await this.prisma.vote.create({
      data: {
        id: vote.id,
        surveyId: vote.surveyId,
        optionId: vote.optionId,
        voterId: vote.voterId,
        weight: vote.weight,
        comment: vote.comment,
        isAnonymous: vote.isAnonymous,
        createdAt: vote.createdAt,
      },
    });

    return this.mapToEntity(created);
  }

  async createMany(votes: Vote[]): Promise<Vote[]> {
    const created = await this.prisma.vote.createMany({
      data: votes.map((vote) => ({
        id: vote.id,
        surveyId: vote.surveyId,
        optionId: vote.optionId,
        voterId: vote.voterId,
        weight: vote.weight,
        comment: vote.comment,
        isAnonymous: vote.isAnonymous,
        createdAt: vote.createdAt,
      })),
    });

    return votes;
  }

  async findBySurveyId(surveyId: string): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { surveyId },
      orderBy: { createdAt: "desc" },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findByOptionId(optionId: string): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { optionId },
      orderBy: { createdAt: "desc" },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findByVoterId(voterId: string): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { voterId },
      orderBy: { createdAt: "desc" },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findBySurveyAndVoter(
    surveyId: string,
    voterId: string
  ): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: {
        surveyId,
        voterId,
      },
      orderBy: { createdAt: "desc" },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findBySurveyAndOption(
    surveyId: string,
    optionId: string
  ): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: {
        surveyId,
        optionId,
      },
      orderBy: { createdAt: "desc" },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findById(id: string): Promise<Vote | null> {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
    });

    return vote ? this.mapToEntity(vote) : null;
  }

  async update(id: string, data: Partial<Vote>): Promise<Vote> {
    const updated = await this.prisma.vote.update({
      where: { id },
      data: {
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.comment !== undefined && { comment: data.comment }),
        ...(data.isAnonymous !== undefined && {
          isAnonymous: data.isAnonymous,
        }),
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vote.delete({
      where: { id },
    });
  }

  async deleteBySurveyId(surveyId: string): Promise<void> {
    await this.prisma.vote.deleteMany({
      where: { surveyId },
    });
  }

  async deleteByVoterAndSurvey(
    voterId: string,
    surveyId: string
  ): Promise<void> {
    await this.prisma.vote.deleteMany({
      where: {
        voterId,
        surveyId,
      },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.vote.count({
      where: { id },
    });
    return count > 0;
  }

  async hasVoted(voterId: string, surveyId: string): Promise<boolean> {
    const count = await this.prisma.vote.count({
      where: {
        voterId,
        surveyId,
      },
    });
    return count > 0;
  }

  async getVoteCount(surveyId: string): Promise<number> {
    return this.prisma.vote.count({
      where: { surveyId },
    });
  }

  async getUniqueVoterCount(surveyId: string): Promise<number> {
    const result = await this.prisma.vote.groupBy({
      by: ["voterId"],
      where: { surveyId },
    });
    return result.length;
  }

  private mapToEntity(data: any): Vote {
    return new Vote(
      data.id,
      data.surveyId,
      data.optionId,
      data.voterId,
      data.weight,
      data.comment,
      data.isAnonymous,
      data.createdAt
    );
  }
}
