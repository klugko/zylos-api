import { RoleEntity } from '../entities/role.entity';

export interface RoleRepository {
  create(data: RoleEntity): Promise<RoleEntity>;
  update(id: string, data: Partial<RoleEntity>): Promise<RoleEntity>;
  delete(id: string): Promise<void>;
  findAll(): Promise<RoleEntity[]>;
}
