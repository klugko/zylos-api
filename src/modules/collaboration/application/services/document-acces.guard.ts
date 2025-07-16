import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AccessControlService } from '../../application/services/access-control.service';

@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(private readonly accessService: AccessControlService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const documentId = request.params.documentId;
    if (!userId || !documentId) return false;
    await this.accessService.ensureDocumentAccess(userId, documentId, 'read');
    return true;
  }
}
