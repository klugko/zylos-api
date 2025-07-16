import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreatePartnerRequestDto } from '../dto/create-partner-request.dto';
import { AccessControlService } from '../services/access-control.service';
import { PartnerRequestStatus } from '../../domain/enums/request-status.enum';

@Injectable()
export class CreatePartnerRequestUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accessService: AccessControlService,
  ) {}

  async execute(dto: CreatePartnerRequestDto, userId: string) {
    // Vérifier que l'utilisateur a accès au projet
    await this.accessService.ensureProjectAccess(userId, dto.projectId, 'read');

    // Créer la demande 
    const partnerRequest = await this.prisma.partnerRequest.create({
      data: {
        projectId: dto.projectId,
        userId: userId,
        subject: dto.subject,
        message: dto.message,
        attachment: dto.attachment ?? null,
        status: PartnerRequestStatus.OPEN,
      },
      include: {
        project: { select: { id: true, name: true } },
        user: { select: { id: true, fullname: true, email: true } },
      },
    });

    return partnerRequest;
  }
}
