import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';


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
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        password: user.password ?? '',
        role: user.role,
        isActive: user.isActive,
        skills: user.skills,
        availability: user.availability,
        performanceScore: user.performanceScore,
        googleId: user.googleId ?? null,
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
      },
    });
    return this.toDomain(row);
  }

  async findAllActive(): Promise<User[]> {
    const result = await this.prisma.user.findMany({
      where: { isActive: true },
    });
  
    return result.map(user => new User(
      user.id,
      user.fullname,
      user.email,
      undefined,
      user.role as UserRole,
      user.isActive,
      user.createdAt,
      user.updatedAt,
      user.skills ?? [],
      user.availability ?? 0,
      user.performanceScore ?? 0,
      user.googleId ?? undefined,
    ));
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
  
    const isPasswordValid = await compare(password, row.password);
    if (!isPasswordValid) return null;
  
    return this.toDomain(row);
  }

  async findPaginated(limit: number, page: number): Promise<{ items: User[]; total: number }> {
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
  
    return {
      items: users.map(
        (u) =>
          new User(
            u.id,
            u.fullname,
            u.email,
            undefined,
            u.role as UserRole,
            u.isActive,
            u.createdAt,
            u.updatedAt,
            u.skills,
            u.availability,
            u.performanceScore,
            u.googleId,
          ),
      ),
      total,
    };
  }
  
  
}
