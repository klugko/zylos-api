import { IsUUID, IsOptional, IsArray, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Configurer base de données' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Initialiser PostgreSQL avec Prisma', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid-de-projet' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ example: '2025-07-05T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2025-07-10T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({ example: [], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiProperty({ example: 'uuid-user', required: false })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @ApiProperty({ example: 'uuid-column', required: false })
  @IsOptional()
  @IsUUID()
  columnId?: string;
}
