import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { AssignRoleDto } from '../dto/assign-role.dto';

@Injectable()
export class AssignRoleUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: AssignRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new Error(`User ${dto.userId} not found`);

    const role = await this.prisma.role.findUnique({ where: { id: dto.roleId } });
    if (!role) throw new Error(`Role ${dto.roleId} not found`);

    return this.prisma.userRoleAssignment.create({
      data: {
        userId: dto.userId,
        roleId: dto.roleId,
        projectId: dto.projectId || null,
      },
    });
  }
}
