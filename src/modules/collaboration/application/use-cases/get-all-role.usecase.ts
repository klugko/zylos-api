import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/tokens';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';

@Injectable()
export class GetAllRolesUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repo: RoleRepository) {}

  async execute() {
    return this.repo.findAll();
  }
}
