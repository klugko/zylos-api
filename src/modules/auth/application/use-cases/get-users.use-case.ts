import { Injectable, Inject } from '@nestjs/common';
import { AuthRepository } from '../../domain/interfaces/auth-repository.interface';
import { GetUsersDto } from '../dto/get-users.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
  ) {}

  async execute(dto: GetUsersDto) {
    const { page, limit, search } = dto;
    return this.authRepo.findAllWithFilters(page, limit, search);
  }
}
