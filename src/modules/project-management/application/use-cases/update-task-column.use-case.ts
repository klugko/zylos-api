import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";
import { UpdateTaskColumnDto } from "../dto/update-task-column.dto";

@Injectable()
export class UpdateTaskColumnUseCase {
  constructor(
    @Inject("TaskColumnRepository")
    private readonly taskColumnRepository: TaskColumnRepository
  ) {}

  async execute(id: string, dto: UpdateTaskColumnDto) {
    const existingColumn = await this.taskColumnRepository.findById(id);
    if (!existingColumn) {
      throw new NotFoundException(`Colonne ${id} non trouvée.`);
    }

    return await this.taskColumnRepository.update(id, dto);
  }
}
