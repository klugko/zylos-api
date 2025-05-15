import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChecklistDto {
  @ApiProperty({
    description: 'Titre de la checklist à créer',
    example: 'Checklist de lancement de projet',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "ID du projet auquel cette checklist est associée",
    example: 'a3e121ef-b0f3-4b8d-86de-f0d221846a6f',
  })
  @IsString()
  projectId: string;
}
