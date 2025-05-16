import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsNumber, MaxLength, IsBoolean } from 'class-validator';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';


export class CreateProjectDto {
  @ApiProperty({ example: 'Refonte du site web' })
name: string;

@ApiProperty({ example: 'Projet de modernisation du site e-commerce', required: false })
description?: string;

@ApiProperty({ enum: ProjectClientType, example: ProjectClientType.CODEUR })
clientType: ProjectClientType;

@ApiProperty({ example: 'Technologie', required: false })
industry?: string;

@ApiProperty({ example: '#CBA034', required: false })
color?: string;

@ApiProperty({ example: '2025-01-10T00:00:00Z', required: false })
startDate?: string;

@ApiProperty({ example: '2025-03-30T00:00:00Z', required: false })
endDate?: string;

@ApiProperty({ example: 15000.50, required: false })
budget?: number;

@ApiProperty({ enum: ProjectStatus, example: ProjectStatus.NOT_STARTED, required: false })
status?: ProjectStatus;

@ApiProperty({ enum: ProjectPriority, example: ProjectPriority.MEDIUM, required: false })
priority?: ProjectPriority;

@ApiProperty({ example: false, required: false })
isArchived?: boolean;

@ApiProperty({ example: 'd9a0f1d2-2352-4a9e-86ff-fc78b3ebfc6c' , required: false})
ownerId?: string;

@ApiProperty({ example: 'ea567c5e-499e-4813-bdd5-3c0ef5fcdb24', required: false })
templateId?: string;
}
