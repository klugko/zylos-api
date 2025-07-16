import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { PartnerRepository } from '../../domain/interfaces/partner-repository.interface';
import { Partner } from '../../domain/entities/partner.entity';

@Injectable()
export class PrismaPartnerRepository implements PartnerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Partner): Promise<Partner> {
    const created = await this.prisma.user.create({
      data: {
        email: data.email,
        fullname: data.fullname,
        external: true,
        partnerType: data.partnerType,
        activationToken: data.activationToken,
        role: 'PARTNER',
        password: 'defaultPassword123', // Add a default or generated password
      },
    });
    return new Partner(created.id, created.email, created.fullname, created.partnerType ?? undefined, created.external, created.activationToken ?? undefined);
  }

  async findByEmail(email: string): Promise<Partner | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return new Partner(user.id, user.email, user.fullname, user.partnerType ?? undefined, user.external, user.activationToken ?? undefined);
  }

  async findById(id: string): Promise<Partner | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? new Partner(u.id, u.email, u.fullname, u.partnerType ?? undefined, u.external, u.activationToken ?? undefined) : null;
  }
  
  async findAll(): Promise<Partner[]> {
    const users = await this.prisma.user.findMany({ where: { external: true } });
    return users.map(u => new Partner(u.id, u.email, u.fullname, u.partnerType ?? undefined, u.external, u.activationToken ?? undefined));
  }
  
  async update(id: string, data: Partial<Partner>): Promise<Partner> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullname: data.fullname,
        email: data.email,
        partnerType: data.partnerType,
        isActive: data.external !== undefined ? data.external : undefined,
      },
    });
    return new Partner(updated.id, updated.email, updated.fullname, updated.partnerType ?? undefined, updated.external, updated.activationToken ?? undefined);
  }
  
  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
  
}
