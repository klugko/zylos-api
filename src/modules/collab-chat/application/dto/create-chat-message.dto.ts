import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
