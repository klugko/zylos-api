import { Injectable, Inject } from '@nestjs/common';
import { PARTNER_REPOSITORY } from '../../domain/tokens';
import { PartnerRepository } from '../../domain/interfaces/partner-repository.interface';
import { CreatePartnerDto } from '../dto/create-partner.dto';
import { Partner } from '../../domain/entities/partner.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreatePartnerUseCase {
  constructor(
    @Inject(PARTNER_REPOSITORY)
    private readonly partnerRepo: PartnerRepository,
  ) {}

  async execute(dto: CreatePartnerDto): Promise<Partner> {
    const token = uuidv4();
    const partner = new Partner('', dto.email, dto.fullname, dto.partnerType, true, token);
    return this.partnerRepo.create(partner);
  }
}
