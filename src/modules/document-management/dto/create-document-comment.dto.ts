import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentCommentDto {
  @ApiProperty({ example: 'Ce montant doit être validé par la direction.' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: 'page:1;line:3',
    description: 'Zone du document concernée par le commentaire (facultatif)',
    required: false,
  })
  @IsOptional()
  @IsString()
  zone?: string;
}
