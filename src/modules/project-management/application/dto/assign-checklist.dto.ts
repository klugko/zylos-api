import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignChecklistDto {
  @ApiProperty({ example: 'e39a8c8f-d1b2-4d8e-985d-75e80c44f431' })
  @IsUUID()
  checklistId: string;
}
