import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyEmailDto {
  @ApiProperty({
    description: "Email verification token",
    example: "abc123def456ghi789",
  })
  @IsString({ message: "Token must be a string" })
  @IsNotEmpty({ message: "Token is required" })
  @Length(32, 64, { message: "Token must be between 32 and 64 characters" })
  token: string;
}
