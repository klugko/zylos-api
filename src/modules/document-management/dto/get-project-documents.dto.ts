import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetProjectDocumentsDto {
  @ApiProperty({ description: 'ID du projet concerné', example: 'proj_abc' })
  @IsNotEmpty()
  projectId: string;
}
