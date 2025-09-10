import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";

@Injectable()
export class DeleteTaskColumnUseCase {
  constructor(
    @Inject("TaskColumnRepository")
    private readonly taskColumnRepository: TaskColumnRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existingColumn = await this.taskColumnRepository.findById(id);
    if (!existingColumn) {
      throw new NotFoundException(`Colonne ${id} non trouvée.`);
    }

    const hasTasks = await this.taskColumnRepository.hasTasks(id);
    if (hasTasks) {
      throw new BadRequestException(
        "Impossible de supprimer une colonne qui contient des tâches."
      );
    }

    await this.taskColumnRepository.delete(id);
  }
}
