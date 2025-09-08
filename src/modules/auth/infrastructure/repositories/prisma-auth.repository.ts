import { Injectable } from "@nestjs/common";
import { compare } from "bcrypt";
import { PrismaService } from "../../../../core/prisma/prisma.service";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { User } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/enums/user-role.enum";

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(user: any): User {
    return new User(
      user.id,
      user.fullname,
      user.email,
      user.password,
      user.role as UserRole,
      user.isActive,
      user.createdAt,
      user.updatedAt,
      user.skills,
      user.availability,
      user.performanceScore,
      user.googleId ?? undefined,
      user.twoFASecret ?? undefined,
      user.isTwoFAEnabled ?? false,
      user.resetToken ?? undefined,
      user.resetTokenExpiry ?? undefined,
      user.passwordChangedAt ?? undefined,
      user.emailVerified ?? false,
      user.emailVerificationToken ?? undefined,
      user.emailVerificationExpiry ?? undefined
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email },
      include: { refreshTokens: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: { refreshTokens: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        password: user.password ?? "",
        role: user.role,
        isActive: user.isActive,
        skills: user.skills,
        availability: user.availability,
        performanceScore: user.performanceScore,
        googleId: user.googleId ?? null,
        twoFASecret: user.twoFASecret ?? null,
        isTwoFAEnabled: user.isTwoFAEnabled ?? false,
        resetToken: user.resetToken ?? null,
        resetTokenExpiry: user.resetTokenExpiry ?? null,
        passwordChangedAt: user.passwordChangedAt ?? null,
      },
    });
    return this.toDomain(row);
  }

  async update(user: User): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        fullname: user.fullname,
        password: user.password,
        role: user.role,
        isActive: user.isActive,
        skills: user.skills,
        availability: user.availability,
        performanceScore: user.performanceScore,
        googleId: user.googleId ?? null,
        twoFASecret: user.twoFASecret ?? null,
        isTwoFAEnabled: user.isTwoFAEnabled ?? false,
        resetToken: user.resetToken ?? null,
        resetTokenExpiry: user.resetTokenExpiry ?? null,
        passwordChangedAt: user.passwordChangedAt ?? null,
      },
    });
    return this.toDomain(row);
  }

  async findAllActive(): Promise<User[]> {
    const result = await this.prisma.user.findMany({
      where: { isActive: true },
      include: { refreshTokens: true },
    });

    return result.map((user) => this.toDomain(user));
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email },
      include: { refreshTokens: true },
    });
    if (!row) return null;

    const isPasswordValid = await compare(password, row.password);
    if (!isPasswordValid) return null;

    return this.toDomain(row);
  }

  async updateResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpiry: Date
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
      include: { refreshTokens: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  async updateTwoFASecret(
    userId: string,
    secret: string | null
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFASecret: secret,
      },
    });
  }

  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async isRefreshTokenRevoked(token: string): Promise<boolean> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    return !refreshToken || refreshToken.revoked;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }

  async findAllWithFilters(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: User[]; total: number }> {
    const where: any = {};

    if (search) {
      const orFilters: any[] = [
        { fullname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { skills: { has: search } },
        { partnerType: { contains: search, mode: "insensitive" } },
      ];

      const validRoles = Object.values(UserRole);
      if (validRoles.includes(search.toUpperCase() as UserRole)) {
        orFilters.push({ role: { equals: search.toUpperCase() as UserRole } });
      }

      where.OR = orFilters;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map((user) => this.toDomain(user)),
      total,
    };
  }

  async updateEmailVerificationStatus(
    userId: string,
    emailVerified: boolean
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified },
    });
  }

  async updateTwoFAStatus(userId: string, isEnabled: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFAEnabled: isEnabled },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
  
  async updateUserSkills(userId: string, skills: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { skills },
    });
  }  
}
