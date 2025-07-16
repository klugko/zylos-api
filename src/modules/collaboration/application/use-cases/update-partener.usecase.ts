import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PARTNER_REPOSITORY } from '../../domain/tokens';
import { PartnerRepository } from '../../domain/interfaces/partner-repository.interface';
import { Partner } from '../../domain/entities/partner.entity';

@Injectable()
export class UpdatePartnerUseCase {
  constructor(@Inject(PARTNER_REPOSITORY) private readonly repo: PartnerRepository) {}

  async execute(id: string, data: Partial<Partner>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Partner ${id} not found`);
    return this.repo.update(id, data);
  }
}
