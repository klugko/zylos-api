import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PARTNER_REPOSITORY } from '../../domain/tokens';
import { PartnerRepository } from '../../domain/interfaces/partner-repository.interface';

@Injectable()
export class GetPartnerUseCase {
  constructor(@Inject(PARTNER_REPOSITORY) private readonly repo: PartnerRepository) {}

  async findOne(id: string) {
    const partner = await this.repo.findById(id);
    if (!partner) throw new NotFoundException(`Partner ${id} not found`);
    return partner;
  }

  async findAll() {
    return this.repo.findAll();
  }
}
