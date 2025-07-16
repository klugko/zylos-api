import { Partner } from '../entities/partner.entity';

export interface PartnerRepository {
  create(data: Partner): Promise<Partner>;
  findByEmail(email: string): Promise<Partner | null>;
  findById(id: string): Promise<Partner | null>;
  findAll(): Promise<Partner[]>;
  update(id: string, data: Partial<Partner>): Promise<Partner>;
  delete(id: string): Promise<void>;
}
