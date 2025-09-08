import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.authRepo.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== existingUser.email) {
      const userWithEmail = await this.authRepo.findByEmail(dto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = new User(
      existingUser.id,
      dto.fullname ?? existingUser.fullname,
      dto.email ?? existingUser.email,
      existingUser.password, 
      dto.role ?? existingUser.role,
      existingUser.isActive,
      existingUser.createdAt,
      new Date(), 
      dto.skills ?? existingUser.skills,
      dto.availability ?? existingUser.availability,
      dto.performanceScore ?? existingUser.performanceScore,
      existingUser.googleId,
      existingUser.avatarUrl,
      existingUser.phone,
      existingUser.poste,
      existingUser.twoFASecret,
      existingUser.isTwoFAEnabled,
      existingUser.resetToken,
      existingUser.resetTokenExpiry,
      existingUser.passwordChangedAt,
      existingUser.emailVerified,
      existingUser.emailVerificationToken,
      existingUser.emailVerificationExpiry
    );

    const saved = await this.authRepo.update(updatedUser);
    
    return new User(
      saved.id,
      saved.fullname,
      saved.email,
      undefined, 
      saved.role,
      saved.isActive,
      saved.createdAt,
      saved.updatedAt,
      saved.skills,
      saved.availability,
      saved.performanceScore,
      saved.googleId,
      saved.avatarUrl,
      saved.phone,
      saved.poste,
      saved.twoFASecret,
      saved.isTwoFAEnabled,
      saved.resetToken,
      saved.resetTokenExpiry,
      saved.passwordChangedAt,
      saved.emailVerified,
      saved.emailVerificationToken,
      saved.emailVerificationExpiry
    );
  }
}