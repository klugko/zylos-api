import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ConvertPartnerRequestDto {
  @ApiProperty({ description: 'Titre de la tâche à créer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description de la tâche', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
