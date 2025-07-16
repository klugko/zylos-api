import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { GetPartnerRequestsDto } from '../dto/get-partner-requests.dto';
import { PartnerRequestStatus } from '@modules/collaboration/domain/enums/request-status.enum';

@Injectable()
export class GetPartnerRequestsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(filter: GetPartnerRequestsDto) {
    return this.prisma.partnerRequest.findMany({
      where: {
        projectId: filter.projectId,
        status: filter.status as PartnerRequestStatus,
      },
      include: {
        user: { select: { fullname: true, email: true } },
        project: { select: { name: true } },
      },
    });
  }
}
