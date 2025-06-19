import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaAuthRepository } from '../../infrastructure/repositories/prisma-auth.repository';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';

@Injectable()
export class GoogleAuthUseCase {
  constructor(
    private readonly jwtService: JwtService,
    @Inject('AuthRepository') private readonly repository: PrismaAuthRepository
  ) {}

  async execute(profile: {
    email: string;
    fullname: string;
    googleId: string;
    avatar?: string;
  }): Promise<{ user: User; accessToken: string }> {
    let user = await this.repository.findByEmail(profile.email);

    user ??= await this.repository.create(
        new User(
          crypto.randomUUID(),
          profile.fullname,
          profile.email,
          undefined,
          UserRole.USER,
          true,
          new Date(),
          new Date(),
          [],
          0,
          0,
          profile.googleId,
        ),
      );

    console.log('JWT_SECRET used for signing:', process.env.JWT_SECRET);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    console.log('Generated Token:', token);

    return { user, accessToken: token };
  }
}
