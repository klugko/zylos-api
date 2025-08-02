import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindProjectsByUserDto {
  @ApiProperty({ example: 'uuid', required: true })
  @IsUUID()
  userId: string;
}
