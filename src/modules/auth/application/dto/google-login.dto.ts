import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'ID Token Google (credential de Google Identity Services)',
  })
  credential!: string;

  @ApiProperty({
    required: false,
    description: 'Nonce attendu (si utilisé côté front lors de l’initialisation GIS)',
  })
  nonce?: string;
}
