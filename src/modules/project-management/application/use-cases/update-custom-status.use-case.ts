import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from "@nestjs/common";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { UpdateCustomStatusDto } from "../dto/update-custom-status.dto";
import { CustomStatus } from "../../domain/entities/custom-status.entity";

@Injectable()
export class UpdateCustomStatusUseCase {
  constructor(
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository
  ) {}

  async execute(id: string, dto: UpdateCustomStatusDto): Promise<CustomStatus> {
    const customStatus = await this.customStatusRepo.findById(id);
    if (!customStatus) {
      throw new NotFoundException("Custom status not found");
    }

    if (dto.name && dto.name !== customStatus.name) {
      const existingStatus = await this.customStatusRepo.findByNameAndProject(
        dto.name,
        customStatus.projectId
      );

      if (existingStatus && existingStatus.id !== id) {
        throw new ConflictException(
          "A status with this name already exists in the project"
        );
      }
    }

    if (dto.name)
      customStatus.updateDetails(
        dto.name,
        dto.description || null,
        dto.color || customStatus.color
      );
    if (dto.description !== undefined)
      customStatus.updateDetails(
        customStatus.name,
        dto.description,
        customStatus.color
      );
    if (dto.color)
      customStatus.updateDetails(
        customStatus.name,
        customStatus.description,
        dto.color
      );
    if (dto.order !== undefined) customStatus.order = dto.order;
    if (dto.isActive !== undefined) {
      dto.isActive ? customStatus.activate() : customStatus.deactivate();
    }

    return await this.customStatusRepo.update(customStatus);
  }
}
