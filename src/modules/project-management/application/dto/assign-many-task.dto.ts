import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class TaskDescriptorDto {
  @ApiProperty({ description: 'Identifiant de la tâche à assigner' })
  @IsString()
  id!: string;

  @ApiProperty({ required: false, description: 'Titre (écrase la valeur stockée si fourni)' })
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'Description (écrase la valeur stockée si fourni)' })
  @IsString()
  description?: string;
}

export class BulkAssignTasksDto {
  @ApiProperty({
    description: 'Tableau de tâches à assigner',
    type: [TaskDescriptorDto],
    example: {
        tasks: [
          {
            "id": "task_101",
            "title": "Créer landing page produit",
            "description": "Concevoir la page d'accueil du nouveau produit."
          },
          {
            "id": "task_102",
            "title": "Mettre à jour documentation API",
            "description": "Ajouter les endpoints v2 et des exemples cURL."
          },
          {
            "id": "task_103",
            "title": "Tests end-to-end",
            "description": "Écrire des tests Cypress pour le flux d'inscription."
          }
        ]
      }
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TaskDescriptorDto)
  tasks!: TaskDescriptorDto[];
}
