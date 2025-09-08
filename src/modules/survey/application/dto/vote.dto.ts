import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateVoteDto {
  @ApiProperty({
    description: "ID de l'option sélectionnée",
    example: "opt_123456789",
  })
  @IsString()
  optionId: string;

  @ApiProperty({
    description: "Poids du vote (0-10) pour le vote pondéré",
    example: 8.5,
    required: false,
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  weight?: number;

  @ApiProperty({
    description: "Commentaire optionnel sur le vote",
    example: "Je pense que React est plus adapté pour notre équipe",
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "Vote anonyme",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}

export class CreateMultipleVotesDto {
  @ApiProperty({
    description: "Liste des IDs des options sélectionnées",
    example: ["opt_123456789", "opt_987654321", "opt_456789123"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  optionIds: string[];

  @ApiProperty({
    description: "Commentaire optionnel sur les votes",
    example: "J'ai voté pour plusieurs options car elles sont complémentaires",
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "Votes anonymes",
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
