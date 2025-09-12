import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum PdfFormat {
  A4 = 'A4',
  LETTER = 'Letter'
}

export enum PdfOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

export class GeneratePdfDto {
  @ApiProperty({
    description: 'Titre du document PDF',
    example: 'Rapport de mes projets et tâches'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Contenu personnalisé à inclure dans le PDF',
    example: 'Voici un résumé de mes activités récentes...',
    required: false
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Inclure les informations utilisateur dans le PDF',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeUserInfo?: boolean = true;

  @ApiProperty({
    description: 'Inclure les projets dans le PDF',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeProjects?: boolean = true;

  @ApiProperty({
    description: 'Inclure les tâches dans le PDF',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeTasks?: boolean = true;

  @ApiProperty({
    description: 'Inclure les documents dans le PDF',
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  includeDocuments?: boolean = true;

  @ApiProperty({
    description: 'Format du PDF',
    enum: PdfFormat,
    example: PdfFormat.A4,
    default: PdfFormat.A4
  })
  @IsOptional()
  @IsEnum(PdfFormat)
  format?: PdfFormat = PdfFormat.A4;

  @ApiProperty({
    description: 'Orientation du PDF',
    enum: PdfOrientation,
    example: PdfOrientation.PORTRAIT,
    default: PdfOrientation.PORTRAIT
  })
  @IsOptional()
  @IsEnum(PdfOrientation)
  orientation?: PdfOrientation = PdfOrientation.PORTRAIT;
}

export class GeneratePdfResponseDto {
  @ApiProperty({
    description: 'Indique si la génération a réussi',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'URL de téléchargement du PDF généré',
    example: '/uploads/pdf/1703123456789-rapport-projets.pdf',
    required: false
  })
  downloadUrl?: string;

  @ApiProperty({
    description: 'Message de succès ou d\'erreur',
    example: 'PDF généré avec succès'
  })
  message: string;

  @ApiProperty({
    description: 'Détails de l\'erreur en cas d\'échec',
    example: 'Erreur lors de la génération du PDF',
    required: false
  })
  error?: string;
}
