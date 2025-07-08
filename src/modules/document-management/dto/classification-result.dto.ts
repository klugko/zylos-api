import { ApiProperty } from '@nestjs/swagger';

export class ClassificationResultDto {
  @ApiProperty({ example: ['contrat client', 'confidentiel'] })
  tags: string[];

  @ApiProperty({ example: { montant: '100 000 MGA', date: '2025-01-01' } })
  metadata: Record<string, any>;

  @ApiProperty({ example: false })
  validationRequired: boolean;
}
