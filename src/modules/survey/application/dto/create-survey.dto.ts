import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { SurveyType, VoteType } from "../../domain/enums/survey.enums";

export class CreateSurveyOptionDto {
  @ApiProperty({
    description: "Texte de l'option",
    example: "Option A - Développement frontend",
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: "Description détaillée de l'option",
    example: "Développement de l'interface utilisateur avec React",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Poids de l'option pour le vote pondéré",
    example: 1.5,
    required: false,
  })
  @IsOptional()
  @Min(0)
  weight?: number;

  @ApiProperty({
    description: "Ordre d'affichage de l'option",
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class CreateSurveyDto {
  @ApiProperty({
    description: "Titre du sondage",
    example: "Quelle technologie utiliser pour le frontend ?",
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: "Description détaillée du sondage",
    example:
      "Nous devons choisir la technologie frontend pour notre nouveau projet. Votez pour votre préférence.",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Type de sondage",
    enum: SurveyType,
    example: SurveyType.MULTIPLE_CHOICE,
  })
  @IsEnum(SurveyType)
  type: SurveyType;

  @ApiProperty({
    description: "Type de vote",
    enum: VoteType,
    example: VoteType.SINGLE,
  })
  @IsEnum(VoteType)
  voteType: VoteType;

  @ApiProperty({
    description: "ID du projet associé",
    example: "proj_123456789",
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiProperty({
    description: "ID de la tâche associée",
    example: "task_987654321",
    required: false,
  })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiProperty({
    description: "Autoriser plusieurs votes par utilisateur",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowMultipleVotes?: boolean;

  @ApiProperty({
    description: "Sondage anonyme",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: "Nombre maximum de votes par utilisateur",
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxVotesPerUser?: number;

  @ApiProperty({
    description: "Activer le vote pondéré",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  weightEnabled?: boolean;

  @ApiProperty({
    description: "Date de début du sondage (ISO 8601)",
    example: "2024-01-15T09:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: "Date de fin du sondage (ISO 8601)",
    example: "2024-01-22T18:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: "Options de vote",
    type: [CreateSurveyOptionDto],
    example: [
      {
        text: "React + TypeScript",
        description: "Développement avec React et TypeScript",
        weight: 1.0,
        order: 1,
      },
      {
        text: "Vue.js + Composition API",
        description: "Développement avec Vue.js 3 et Composition API",
        weight: 1.2,
        order: 2,
      },
      {
        text: "Angular + RxJS",
        description: "Développement avec Angular et RxJS",
        weight: 0.8,
        order: 3,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyOptionDto)
  options: CreateSurveyOptionDto[];
}
