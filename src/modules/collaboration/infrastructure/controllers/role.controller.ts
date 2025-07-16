import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateRoleDto } from '../../application/dto/create-role.dto';
import { CreateRoleUseCase } from '../../application/use-cases/create-role.usecase';
import { UpdateRoleUseCase } from '../../application/use-cases/update-role.usecase';
import { DeleteRoleUseCase } from '../../application/use-cases/delete-role.usecase';
import { AssignRoleUseCase } from '../../application/use-cases/assign-role.usecase';
import { AssignRoleDto } from '../../application/dto/assign-role.dto';
import { RoleEntity } from '../../domain/entities/role.entity';
import { GetAllRolesUseCase } from '@modules/collaboration/application/use-cases/get-all-role.usecase';
import { GetRoleByIdUseCase } from '@modules/collaboration/application/use-cases/get-role-id.usecase';

@ApiTags('collaboration/roles')
@Controller('collaboration/roles')
export class RoleController {
  constructor(
    private readonly createRole: CreateRoleUseCase,
    private readonly updateRole: UpdateRoleUseCase,
    private readonly deleteRole: DeleteRoleUseCase,
    private readonly assignRole: AssignRoleUseCase,
    private readonly getAllRoles: GetAllRolesUseCase,
    private readonly getRoleById: GetRoleByIdUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateRoleDto): Promise<RoleEntity> {
    return this.createRole.execute(dto);
  }

  @Get()
  async getAll(): Promise<RoleEntity[]> {
    return this.getAllRoles.execute();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<RoleEntity> {
    return this.getRoleById.execute(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<RoleEntity>): Promise<RoleEntity> {
    return this.updateRole.execute(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteRole.execute(id);
    return { message: 'Role deleted successfully' };
  }

  @Post('assign')
  async assign(@Body() dto: AssignRoleDto) {
    return this.assignRole.execute(dto);
  }
}
