import { IsUUID, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SummarizeChatDto {
  @ApiProperty({
    description: "ID du projet",
    example: "10000000-0000-0000-0000-000000000001",
  })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({
    description: "Texte long à résumer (ex: transcription de visio)",
    example: "Voici les points discutés pendant notre visio : ...",
  })
  @IsString()
  @IsNotEmpty()
  messageContent: string;
}
