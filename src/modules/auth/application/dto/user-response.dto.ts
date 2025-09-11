import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "../../domain/enums/user-role.enum";

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullname: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty()
  availability: number;

  @ApiProperty()
  performanceScore: number;

  @ApiProperty({ required: false })
  googleId?: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  poste?: string;

  @ApiProperty()
  isTwoFAEnabled: boolean;

  @ApiProperty({ required: false })
  passwordChangedAt?: Date;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty({ required: false })
  emailVerificationToken?: string;

  @ApiProperty({ required: false })
  emailVerificationExpiry?: Date;
}
