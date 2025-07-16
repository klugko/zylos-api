import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

// Vérifie si le rôle attribué permet l'accès au module
@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) return false;

    // Récupérer tous les rôles assignés
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: true },
    });

    const hasDashboardAccess = assignments.some(a => a.role.canUseDashboard);
    if (!hasDashboardAccess) throw new ForbiddenException('You do not have access to dashboards');

    return true;
  }
}
