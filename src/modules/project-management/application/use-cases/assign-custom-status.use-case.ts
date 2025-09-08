import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { ICustomStatusRepository } from "../../domain/interfaces/custom-status-repository.interface";
import { IStatusDurationRepository } from "../../domain/interfaces/status-duration-repository.interface";
import { ITaskRepository } from "../../domain/interfaces/task-repository.interface";
import { AssignCustomStatusDto } from "../dto/assign-custom-status.dto";
import { StatusDuration } from "../../domain/entities/status-duration.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AssignCustomStatusUseCase {
  constructor(
    @Inject("ICustomStatusRepository")
    private readonly customStatusRepo: ICustomStatusRepository,
    @Inject("IStatusDurationRepository")
    private readonly statusDurationRepo: IStatusDurationRepository,
    @Inject("TaskRepository")
    private readonly taskRepo: ITaskRepository
  ) {}

  async execute(dto: AssignCustomStatusDto): Promise<StatusDuration> {
    const task = await this.taskRepo.findById(dto.taskId);
    if (!task) {
      throw new NotFoundException("Task not found");
    }

    const customStatus = await this.customStatusRepo.findById(
      dto.customStatusId
    );
    if (!customStatus) {
      throw new NotFoundException("Custom status not found");
    }

    const activeDuration = await this.statusDurationRepo.findActiveByTaskId(
      dto.taskId
    );
    if (activeDuration) {
      activeDuration.complete(new Date());
      await this.statusDurationRepo.update(activeDuration);
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const statusDuration = new StatusDuration(
      uuidv4(),
      dto.taskId,
      dto.customStatusId,
      task.projectId,
      startDate,
      null,
      0,
      new Date(),
      new Date()
    );

    return await this.statusDurationRepo.create(statusDuration);
  }
}
