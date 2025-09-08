import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from "@nestjs/common";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { ProjectRepository } from "../../domain/interfaces/project-repository.interface";
import { CreateCustomStatusDto } from "../dto/create-custom-status.dto";
import { CustomStatus } from "../../domain/entities/custom-status.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateCustomStatusUseCase {
  constructor(
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("ProjectRepository")
    private readonly projectRepo: ProjectRepository
  ) {}

  async execute(dto: CreateCustomStatusDto): Promise<CustomStatus> {
    const project = await this.projectRepo.findById(dto.projectId);
    if (!project) {
      throw new NotFoundException("Project not found");
    }

    const existingStatus = await this.customStatusRepo.findByNameAndProject(
      dto.name,
      dto.projectId
    );

    if (existingStatus) {
      throw new ConflictException(
        "A status with this name already exists in the project"
      );
    }

    const customStatus = new CustomStatus(
      uuidv4(),
      dto.name,
      dto.description || null,
      dto.color,
      dto.order,
      dto.projectId,
      new Date(),
      new Date(),
      true,
      dto.isDefault || false
    );

    return await this.customStatusRepo.create(customStatus);
  }
}
