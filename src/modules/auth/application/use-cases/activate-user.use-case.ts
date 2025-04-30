import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';


@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository
  ) {}
  
  async execute(id: string): Promise<void> {
    const user = await this.authRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.activate();
    await this.authRepo.update(user);
  }
}
