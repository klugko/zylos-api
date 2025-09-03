import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsBoolean } from 'class-validator';

export class TwoFAGenerateResponseDto {
  @ApiProperty({
    example: 'JBSWY3DPEHPK3PXP',
    description: '2FA secret key for authenticator app',
  })
  secret: string;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'QR code data URL for scanning with authenticator app',
  })
  qrCodeUrl: string;
}

export class TwoFAVerifyDto {
  @ApiProperty({
    example: '123456',
    description: '6-digit code from authenticator app',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class TwoFAStatusDto {
  @ApiProperty({
    example: true,
    description: '2FA activation status',
  })
  @IsBoolean()
  enabled: boolean;
}