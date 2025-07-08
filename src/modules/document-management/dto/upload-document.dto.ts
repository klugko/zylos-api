import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Identifiant du projet', example: 'proj_123' })
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Type de document', example: 'Contrat' })
  @IsNotEmpty()
  type: string;
}
