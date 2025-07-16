import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class GetPartnerRequestDetailsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(requestId: string) {
    const req = await this.prisma.partnerRequest.findUnique({
      where: { id: requestId },
      include: {
        messages: {
          include: {
            sender: { select: { fullname: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!req) throw new NotFoundException('Demande introuvable');
    return req;
  }
}
