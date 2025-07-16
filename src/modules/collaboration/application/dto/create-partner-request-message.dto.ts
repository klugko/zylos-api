import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartnerRequestMessageDto {
  @ApiProperty({ description: 'Contenu du message' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
