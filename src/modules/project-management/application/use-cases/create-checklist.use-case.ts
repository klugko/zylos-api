import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistRepository } from '../../domain/interfaces/checklist-repository.interface';
import { CreateChecklistDto } from '../dto/create-checklist.dto';


@Injectable()
export class CreateChecklistUseCase {
  constructor(
    @Inject('ChecklistRepository') private readonly checklistRepo: ChecklistRepository
  ) {}
  async execute(dto: CreateChecklistDto): Promise<Checklist> {
    const now = new Date();
    const checklist = new Checklist(
      uuidv4(),
      dto.title,
      false,
      dto.projectId,
      now,
      now
    );
    return await this.checklistRepo.create(checklist);
  }
}
