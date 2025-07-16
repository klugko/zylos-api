import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreatePartnerRequestMessageDto } from '../dto/create-partner-request-message.dto';

@Injectable()
export class AddPartnerRequestMessageUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(requestId: string, dto: CreatePartnerRequestMessageDto, userId: string) {
    const req = await this.prisma.partnerRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Demande introuvable');

    return this.prisma.partnerRequestMessage.create({
      data: {
        requestId,
        senderId: userId,
        content: dto.content,
      },
    });
  }
}
