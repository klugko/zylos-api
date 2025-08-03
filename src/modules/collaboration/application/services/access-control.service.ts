import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AccessControlService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureProjectAccess(userId: string, projectId: string, permission: 'read' | 'write' | 'comment' | 'validate' = 'read') {
    // Vérifie d'abord si l'utilisateur est owner ou membre interne
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { owner: true },
    });
    if (!project) throw new ForbiddenException('Project not found');

    if (project.ownerId === userId) return true; // propriétaire = accès total

    // Sinon, regarde ProjectAccess
    const access = await this.prisma.projectAccess.findFirst({ where: { projectId, userId } });
    if (!access) throw new ForbiddenException('Vous n’avez pas encore accès à ce projet.');

    const allowed =
      (permission === 'read' && access.canRead) ||
      (permission === 'write' && access.canWrite) ||
      (permission === 'comment' && access.canComment) ||
      (permission === 'validate' && access.canValidate);

    if (!allowed) throw new ForbiddenException(`Missing ${permission} permission`);
    return true;
  }

  async ensureDocumentAccess(userId: string, documentId: string, permission: 'read' | 'write' | 'comment' = 'read') {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    console.log('Document:', document);
    if (!document) throw new ForbiddenException('Document not found');

    // Owner du projet = accès total
    const project = await this.prisma.project.findUnique({ where: { id: document.projectId } });
    if (project?.ownerId === userId) return true;

    // Sinon, regarde DocumentAccess
    const access = await this.prisma.documentAccess.findFirst({ where: { documentId, userId } });
    if (!access) throw new ForbiddenException('Access denied to this document');

    const allowed =
      (permission === 'read' && access.canRead) ||
      (permission === 'write' && access.canWrite) ||
      (permission === 'comment' && access.canComment);

    if (!allowed) throw new ForbiddenException(`Missing ${permission} permission`);
    return true;
  }
}
