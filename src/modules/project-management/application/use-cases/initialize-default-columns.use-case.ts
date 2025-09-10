import { Injectable, Inject } from "@nestjs/common";
import { TaskColumnRepository } from "../../domain/interfaces/task-column-repository.interface";
import { TaskColumn } from "../../domain/entities/task-column.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class InitializeDefaultColumnsUseCase {
  constructor(
    @Inject("TaskColumnRepository")
    private readonly taskColumnRepository: TaskColumnRepository
  ) {}

  async execute(projectId: string): Promise<TaskColumn[]> {
    const existingColumns =
      await this.taskColumnRepository.findByProjectId(projectId);

    if (existingColumns.length > 0) {
      return existingColumns;
    }

    const defaultColumns = [
      { name: "À faire", order: 0 },
      { name: "En cours", order: 1 },
      { name: "Terminée", order: 2 },
    ];

    const columns = defaultColumns.map(
      ({ name, order }) => new TaskColumn(uuidv4(), name, order, projectId)
    );

    const createdColumns = [];
    for (const column of columns) {
      const created = await this.taskColumnRepository.create(column);
      createdColumns.push(created);
    }

    return createdColumns;
  }
}
