import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { AvatarStorageService } from '../../infrastructure/services/avatar-storage.service';

@Injectable()
export class UpdateAvatarUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
    private readonly avatarStorage: AvatarStorageService,
  ) {}

  async execute(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    // Vérifier que l'utilisateur existe
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Supprimer l'ancien avatar s'il existe
    if (user.avatarUrl) {
      await this.avatarStorage.deleteAvatar(user.avatarUrl);
    }

    // Sauvegarder le nouvel avatar
    const avatarUrl = await this.avatarStorage.saveAvatar(file);

    // Mettre à jour l'utilisateur
    user.updateAvatar(avatarUrl);
    await this.authRepo.update(user);

    return { avatarUrl };
  }
}
