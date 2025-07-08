import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SubmitSignatureDto {
  @ApiProperty({
    description: 'Image encodée en base64 représentant la signature',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...',
  })
  @IsNotEmpty()
  base64Image: string;
}
