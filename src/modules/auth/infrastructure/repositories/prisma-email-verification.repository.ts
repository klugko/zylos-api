import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { EmailVerificationRepository } from "../../domain/interfaces/email-verification-repository.interface";
import { EmailVerification } from "../../domain/entities/email-verification.entity";

@Injectable()
export class PrismaEmailVerificationRepository
  implements EmailVerificationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    emailVerification: EmailVerification
  ): Promise<EmailVerification> {
    const created = await this.prisma.emailVerification.create({
      data: {
        id: emailVerification.id,
        userId: emailVerification.userId,
        email: emailVerification.email,
        token: emailVerification.token,
        expiresAt: emailVerification.expiresAt,
        isUsed: emailVerification.isUsed,
        createdAt: emailVerification.createdAt,
      },
    });

    return new EmailVerification(
      created.id,
      created.userId,
      created.email,
      created.token,
      created.expiresAt,
      created.isUsed,
      created.createdAt
    );
  }

  async findByToken(token: string): Promise<EmailVerification | null> {
    const found = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!found) {
      return null;
    }

    return new EmailVerification(
      found.id,
      found.userId,
      found.email,
      found.token,
      found.expiresAt,
      found.isUsed,
      found.createdAt
    );
  }

  async findByUserId(userId: string): Promise<EmailVerification | null> {
    const found = await this.prisma.emailVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!found) {
      return null;
    }

    return new EmailVerification(
      found.id,
      found.userId,
      found.email,
      found.token,
      found.expiresAt,
      found.isUsed,
      found.createdAt
    );
  }

  async update(
    emailVerification: EmailVerification
  ): Promise<EmailVerification> {
    const updated = await this.prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: {
        isUsed: emailVerification.isUsed,
      },
    });

    return new EmailVerification(
      updated.id,
      updated.userId,
      updated.email,
      updated.token,
      updated.expiresAt,
      updated.isUsed,
      updated.createdAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.emailVerification.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.emailVerification.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
