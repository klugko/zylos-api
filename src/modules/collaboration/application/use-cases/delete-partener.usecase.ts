import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PARTNER_REPOSITORY } from '../../domain/tokens';
import { PartnerRepository } from '../../domain/interfaces/partner-repository.interface';

@Injectable()
export class DeletePartnerUseCase {
  constructor(@Inject(PARTNER_REPOSITORY) private readonly repo: PartnerRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Partner ${id} not found`);
    await this.repo.delete(id);
    return { message: 'Partner deleted successfully' };
  }
}
