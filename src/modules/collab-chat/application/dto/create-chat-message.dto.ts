import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, MaxLength } from 'class-validator';

export class CreateChatMessageDto {
  @ApiProperty({ example: 'd7981fd3-82ff-45a7-8ec1-2e92aee92c2e' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'C’est noté, je m’en occupe demain.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;
}
