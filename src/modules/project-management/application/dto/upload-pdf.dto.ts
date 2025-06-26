import { ApiProperty } from '@nestjs/swagger';

export class UploadPdfDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'Le fichier PDF du cahier de charges' })
  file: any;
}
