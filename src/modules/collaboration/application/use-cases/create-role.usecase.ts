import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/tokens';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';
import { CreateRoleDto } from '../dto/create-role.dto';
import { RoleEntity } from '../../domain/entities/role.entity';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly repo: RoleRepository,
  ) {}

  async execute(dto: CreateRoleDto): Promise<RoleEntity> {
    const role = new RoleEntity(
      '',
      dto.name,
      dto.description,
      dto.canRead,
      dto.canWrite,
      dto.canComment,
      dto.canValidate,
      dto.canDelete,
      dto.canUseVisio,
      dto.canUseDashboard,
    );
    return this.repo.create(role);
  }
}
