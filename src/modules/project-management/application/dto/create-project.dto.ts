import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsNumber, MaxLength, IsBoolean, IsPositive } from 'class-validator';
import { ProjectClientType, ProjectPriority, ProjectStatus } from '../../domain/enums/project.enums';


export class CreateProjectDto {
@ApiProperty({ example: 'd9a0f1d2-2352-4a9e-86ff-fc78b3ebfc6c', required: true })
@IsString()
@MaxLength(36)
id: string;

@ApiProperty({ example: 'Refonte du site web' })
@IsString()
@MaxLength(255)
name: string;

@ApiProperty({ example: 'Projet de modernisation du site e-commerce', required: false })
@IsString()
@IsOptional()
description?: string;

@ApiProperty({ enum: ProjectClientType, example: ProjectClientType.CODEUR })
@IsEnum(ProjectClientType)
clientType: ProjectClientType;

@ApiProperty({ example: 'Technologie', required: false })
@IsString()
@IsOptional()
@MaxLength(255)
industry?: string;

@ApiProperty({ example: '#CBA034', required: false })
@IsString()
@IsOptional()
color?: string;

@ApiProperty({ example: '2025-01-10T00:00:00Z', required: false })
@IsDateString()
@IsOptional()
startDate?: string;

@ApiProperty({ example: '2025-03-30T00:00:00Z', required: false })
@IsDateString()
@IsOptional()
endDate?: string;

@ApiProperty({ example: 15000.50, required: false })
@IsNumber()
@IsOptional()
@IsPositive()
budget?: number;

@ApiProperty({ enum: ProjectStatus, example: ProjectStatus.NOT_STARTED, required: false })
@IsEnum(ProjectStatus)
@IsOptional()
status?: ProjectStatus;

@ApiProperty({ enum: ProjectPriority, example: ProjectPriority.MEDIUM, required: false })
@IsEnum(ProjectPriority)
@IsOptional()
priority?: ProjectPriority;

@ApiProperty({ example: false, required: false })
@IsBoolean()
@IsOptional()
isArchived?: boolean;

@ApiProperty({example: 'ea567c5e-499e-4813-bdd5-3c0ef5fcdb24', required: false })
@IsOptional()
ownerId?: string;

@ApiProperty({ example: 'ea567c5e-499e-4813-bdd5-3c0ef5fcdb24', required: false })
@IsString()
@MaxLength(36)
@IsOptional()
templateId?: string;
}
