import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/prisma/prisma.module';

import { PartnerController } from './infrastructure/controllers/partner.controller';
import { RoleController } from './infrastructure/controllers/role.controller';
import { CreatePartnerUseCase } from './application/use-cases/create-partner.usecase';
import { CreateRoleUseCase } from './application/use-cases/create-role.usecase';
import { UpdateRoleUseCase } from './application/use-cases/update-role.usecase';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.usecase';
import { AssignRoleUseCase } from './application/use-cases/assign-role.usecase';
import { PrismaPartnerRepository } from './infrastructure/repositories/prisma-partner.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';
import { PARTNER_REPOSITORY, ROLE_REPOSITORY } from './domain/tokens';
import { GetPartnerUseCase } from './application/use-cases/get-partener.usecase';
import { UpdatePartnerUseCase } from './application/use-cases/update-partener.usecase';
import { DeletePartnerUseCase } from './application/use-cases/delete-partener.usecase';
import { GetAllRolesUseCase } from './application/use-cases/get-all-role.usecase';
import { GetRoleByIdUseCase } from './application/use-cases/get-role-id.usecase';


@Module({
  imports: [PrismaModule],
  controllers: [
    PartnerController,
    RoleController,
  ],
  providers: [
    CreatePartnerUseCase,
    GetPartnerUseCase,
    UpdatePartnerUseCase,
    DeletePartnerUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    AssignRoleUseCase,
    GetAllRolesUseCase,
    GetRoleByIdUseCase,

    {
      provide: PARTNER_REPOSITORY,
      useClass: PrismaPartnerRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [
    CreatePartnerUseCase,
    GetPartnerUseCase,
    UpdatePartnerUseCase,
    DeletePartnerUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    AssignRoleUseCase,
    GetAllRolesUseCase,
    GetRoleByIdUseCase,
  ],
})
export class CollaborationModule {}
