import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { RoleRepository } from '../../domain/interfaces/role-repository.interface';
import { RoleEntity } from '../../domain/entities/role.entity';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: RoleEntity): Promise<RoleEntity> {
    const created = await this.prisma.role.create({ data });
    return this.mapToEntity(created);
  }

  async update(id: string, data: Partial<RoleEntity>): Promise<RoleEntity> {
    const updated = await this.prisma.role.update({ where: { id }, data });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({ where: { id } });
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prisma.role.findMany();
    return roles.map(this.mapToEntity);
  }

  private mapToEntity(role: any): RoleEntity {
    return new RoleEntity(
      role.id,
      role.name,
      role.description ?? undefined,
      role.canRead,
      role.canWrite,
      role.canComment,
      role.canValidate,
      role.canDelete,
      role.canUseVisio,
      role.canUseDashboard,
    );
  }
}
