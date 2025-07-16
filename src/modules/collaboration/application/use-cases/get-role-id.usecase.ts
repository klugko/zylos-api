import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/tokens';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(@Inject(ROLE_REPOSITORY) private readonly repo: RoleRepository) {}

  async execute(id: string) {
    const roles = await this.repo.findAll();
    const role = roles.find(r => r.id === id);
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }
}
