import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartnerRequestDto {
  @ApiProperty({ description: 'ID du projet' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'Sujet de la demande' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Message de la demande' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'URL de la pièce jointe', required: false })
  @IsOptional()
  @IsString()
  attachment?: string;
}
