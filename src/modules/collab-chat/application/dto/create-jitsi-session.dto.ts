import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateJitsiSessionDto {
  @ApiProperty({
    example: 'https://meet.jit.si/nom-de-la-reunion',
    description: 'Lien de la visio Jitsi',
  })
  @IsNotEmpty()
  @IsUrl()
  meetingUrl: string;
}
