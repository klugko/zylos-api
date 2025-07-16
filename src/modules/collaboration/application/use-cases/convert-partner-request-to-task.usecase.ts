import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ConvertPartnerRequestDto } from '../dto/convert-partner-request.dto';
import { PartnerRequestStatus } from '../../domain/enums/request-status.enum';

@Injectable()
export class ConvertPartnerRequestToTaskUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(requestId: string, dto: ConvertPartnerRequestDto, userId: string) {
    const req = await this.prisma.partnerRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Demande introuvable');

    const newTask = await this.prisma.task.create({
      data: {
        projectId: req.projectId,
        title: dto.title,
        description: dto.description,
        assignedUserId: userId,
      },
    });

    await this.prisma.partnerRequest.update({
      where: { id: requestId },
      data: { status: PartnerRequestStatus.CONVERTED_TO_TASK },
    });

    return newTask;
  }
}
