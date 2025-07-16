import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccessControlService } from './access-control.service';

@Injectable()
export class ProjectAccessGuard implements CanActivate {
  constructor(private readonly accessService: AccessControlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id; // récupéré depuis un AuthGuard ou middleware
    const projectId = request.params.projectId;
    if (!userId || !projectId) return false;
    await this.accessService.ensureProjectAccess(userId, projectId, 'read');
    return true;
  }
}
