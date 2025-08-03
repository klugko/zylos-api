import { User } from '@modules/auth/domain/entities/user.entity';
import { AuthRepository } from '@modules/auth/domain/interfaces/auth-repository.interface';
import { Inject, Injectable } from '@nestjs/common';
import { PaginationDto } from '../dto/pagination.dto';

@Injectable()
export class GetPaginatedUsersUseCase {
  constructor(
    @Inject('AuthRepository') private readonly authRepo: AuthRepository,
  ) {}

  async execute(limit: number, page: number): Promise<PaginationDto<User>> {
    const { items, total } = await this.authRepo.findPaginated(limit, page);
    return new PaginationDto<User>(items, total, page, limit);
  }
}
