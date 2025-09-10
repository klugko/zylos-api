import { Injectable, Inject } from "@nestjs/common";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";

@Injectable()
export class ReorderTaskColumnsUseCase {
  constructor(
    @Inject("TaskColumnRepository")
    private readonly taskColumnRepository: TaskColumnRepository
  ) {}

  async execute(
    projectId: string,
    columnOrders: { id: string; order: number }[]
  ) {
    const updatePromises = columnOrders.map(({ id, order }) =>
      this.taskColumnRepository.updateOrder(id, order)
    );

    await Promise.all(updatePromises);

    return await this.taskColumnRepository.findByProjectId(projectId);
  }
}
