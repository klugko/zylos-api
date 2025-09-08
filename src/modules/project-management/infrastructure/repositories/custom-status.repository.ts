import { Injectable } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { CustomStatus } from "../../domain/entities/custom-status.entity";

@Injectable()
export class CustomStatusRepository implements ICustomStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customStatus: CustomStatus): Promise<CustomStatus> {
    const created = await this.prisma.customStatus.create({
      data: {
        id: customStatus.id,
        name: customStatus.name,
        description: customStatus.description,
        color: customStatus.color,
        order: customStatus.order,
        projectId: customStatus.projectId,
        isActive: customStatus.isActive,
        isDefault: customStatus.isDefault,
        createdAt: customStatus.createdAt,
        updatedAt: customStatus.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<CustomStatus | null> {
    const found = await this.prisma.customStatus.findUnique({
      where: { id },
    });

    return found ? this.toDomain(found) : null;
  }

  async findByProjectId(projectId: string): Promise<CustomStatus[]> {
    const found = await this.prisma.customStatus.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });

    return found.map(this.toDomain);
  }

  async findByProjectIdAndActive(projectId: string): Promise<CustomStatus[]> {
    const found = await this.prisma.customStatus.findMany({
      where: { projectId, isActive: true },
      orderBy: { order: "asc" },
    });

    return found.map(this.toDomain);
  }

  async update(customStatus: CustomStatus): Promise<CustomStatus> {
    const updated = await this.prisma.customStatus.update({
      where: { id: customStatus.id },
      data: {
        name: customStatus.name,
        description: customStatus.description,
        color: customStatus.color,
        order: customStatus.order,
        isActive: customStatus.isActive,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customStatus.delete({
      where: { id },
    });
  }

  async findByNameAndProject(
    name: string,
    projectId: string
  ): Promise<CustomStatus | null> {
    const found = await this.prisma.customStatus.findFirst({
      where: { name, projectId },
    });

    return found ? this.toDomain(found) : null;
  }

  private toDomain(prismaCustomStatus: any): CustomStatus {
    return new CustomStatus(
      prismaCustomStatus.id,
      prismaCustomStatus.name,
      prismaCustomStatus.description,
      prismaCustomStatus.color,
      prismaCustomStatus.order,
      prismaCustomStatus.projectId,
      prismaCustomStatus.createdAt,
      prismaCustomStatus.updatedAt,
      prismaCustomStatus.isActive,
      prismaCustomStatus.isDefault
    );
  }
}
