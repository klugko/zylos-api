import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/tokens';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repo: RoleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const allRoles = await this.repo.findAll();
    if (!allRoles.find(r => r.id === id)) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    await this.repo.delete(id);
  }
}
