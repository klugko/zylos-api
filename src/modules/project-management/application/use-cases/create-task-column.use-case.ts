import { Injectable, Inject } from "@nestjs/common";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";
import { CreateTaskColumnDto } from "../dto/create-task-column.dto";
import { TaskColumn } from "../../domain/entities/task-column.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class CreateTaskColumnUseCase {
  constructor(
    @Inject("TaskColumnRepository")
    private readonly taskColumnRepository: TaskColumnRepository
  ) {}

  async execute(dto: CreateTaskColumnDto): Promise<TaskColumn> {
    const existingColumns = await this.taskColumnRepository.findByProjectId(
      dto.projectId
    );
    const maxOrder =
      existingColumns.length > 0
        ? Math.max(...existingColumns.map((col) => col.order))
        : -1;

    const column = new TaskColumn(
      uuidv4(),
      dto.name,
      maxOrder + 1,
      dto.projectId
    );

    return await this.taskColumnRepository.create(column);
  }
}
