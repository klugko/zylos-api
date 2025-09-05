import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEmail,
} from "class-validator";

export class EnableTwoFADto {
  @ApiProperty({
    example: "123456",
    description: "6-digit OTP code from authenticator app",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class DisableTwoFADto {
  @ApiProperty({
    example: "123456",
    description: "6-digit OTP code from authenticator app",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    example: "123456",
    description: "6-digit OTP code from authenticator app",
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}

export class TwoFASetupResponseDto {
  @ApiProperty({
    example: "JBSWY3DPEHPK3PXP",
    description: "2FA secret key for authenticator app",
  })
  secret: string;

  @ApiProperty({
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    description: "QR code data URL for scanning with authenticator app",
  })
  qrCodeUrl: string;

  @ApiProperty({
    example: ["ABC12345", "DEF67890", "GHI11111"],
    description: "Backup codes for account recovery",
  })
  backupCodes: string[];
}

export class TwoFAStatusResponseDto {
  @ApiProperty({
    example: true,
    description: "Whether 2FA is enabled for the user",
  })
  isEnabled: boolean;

  @ApiProperty({
    example: false,
    description: "Whether 2FA is set up but not yet enabled",
  })
  isSetup: boolean;
}

export class LoginWithOtpDto {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: "password123",
    description: "User password",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: "123456",
    description: "6-digit OTP code (required if 2FA is enabled)",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(6, 6)
  otpCode?: string;
}

export class LoginResponseDto {
  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT access token",
  })
  accessToken: string;

  @ApiProperty({
    example: false,
    description: "Whether 2FA verification is required",
  })
  requiresOtp: boolean;

  @ApiProperty({
    example: "User authenticated successfully",
    description: "Response message",
  })
  message: string;
}
