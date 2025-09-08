import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository
  ) {}

  async execute(id: string, currentUser: User): Promise<void> {
    if (currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete users');
    }

    const userToDelete = await this.authRepo.findById(id);
    if (!userToDelete) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.id === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    await this.authRepo.delete(id);
  }
}