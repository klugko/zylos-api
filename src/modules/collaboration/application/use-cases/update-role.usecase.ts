import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/tokens';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';
import { RoleEntity } from '../../domain/entities/role.entity';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repo: RoleRepository,
  ) {}

  async execute(id: string, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const allRoles = await this.repo.findAll();
    if (!allRoles.find(r => r.id === id)) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return this.repo.update(id, data);
  }
}
