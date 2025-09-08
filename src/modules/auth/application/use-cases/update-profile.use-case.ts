import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<{ message: string; user: any }> {
    // Vérifier que l'utilisateur existe
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Vérifier l'unicité de l'email si modifié
    if (dto.email && dto.email !== user.email) {
      const userWithEmail = await this.authRepo.findByEmail(dto.email);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    // Mettre à jour le profil avec tous les champs
    user.updateFullProfile({
      fullname: dto.fullname,
      email: dto.email,
      phone: dto.phone,
      poste: dto.poste,
      skills: dto.skills,
      availability: dto.availability,
      performanceScore: dto.performanceScore,
    });

    const updatedUser = await this.authRepo.update(user);

    return {
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        poste: updatedUser.poste,
        avatarUrl: updatedUser.avatarUrl,
        skills: updatedUser.skills,
        availability: updatedUser.availability,
        performanceScore: updatedUser.performanceScore,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      }
    };
  }
}
