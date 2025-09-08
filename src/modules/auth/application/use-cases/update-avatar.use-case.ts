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

    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatarUrl) {
      await this.avatarStorage.deleteAvatar(user.avatarUrl);
    }

    const avatarUrl = await this.avatarStorage.saveAvatar(file);

    user.updateAvatar(avatarUrl);
    await this.authRepo.update(user);

    return { avatarUrl };
  }
}
