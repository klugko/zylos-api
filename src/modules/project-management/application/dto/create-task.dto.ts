import { ApiProperty } from '@nestjs/swagger';


export class CreateTaskDto {
  @ApiProperty({ example: 'Configurer base de données', description: 'Titre de la tâche' })
  title: string;

  @ApiProperty({ example: 'Initialiser PostgreSQL avec Prisma', required: false })
  description?: string;

  @ApiProperty({ example: 'cdef1234-abcd-5678-efgh-1234567890ab', description: 'ID du projet lié' })
  projectId: string;

  @ApiProperty({ example: '2025-05-06T08:00:00.000Z', description: 'Date de début' })
  startDate: Date;

  @ApiProperty({ example: '2025-05-10T18:00:00.000Z', description: 'Date de fin' })
  endDate: Date;

  @ApiProperty({
    example: ['1234abcd', '5678efgh'],
    required: false,
    description: 'ID des tâches dont dépend cette tâche',
  })
  dependencies?: string[];
}
