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
import { AccessControlService } from './application/services/access-control.service';
import { RolePermissionGuard } from './application/services/role-permission.guard';
import { ProjectAccessGuard } from './application/services/document-access.guard';
import { ProjectProtectedController } from './infrastructure/controllers/project-protected.controller';
import { DocumentProtectedController } from './infrastructure/controllers/document-protected.controller';
import { DocumentAccessGuard } from './application/services/document-acces.guard';


@Module({
  imports: [PrismaModule],
  controllers: [
    PartnerController,
    RoleController,
    ProjectProtectedController,
    DocumentProtectedController,
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
    AccessControlService,
    ProjectAccessGuard,
    DocumentAccessGuard,
    RolePermissionGuard,
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
