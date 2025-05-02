import { Injectable } from '@nestjs/common';
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
      user.performanceScore
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
    ));
  }
  
}
