import { BadRequestException } from "@nestjs/common";
import { UserRole } from "../enums/user-role.enum";

export class User {
  constructor(
    public readonly id: string,
    public fullname: string,
    public email: string,
    public password: string | undefined,
    public role: UserRole,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public skills: string[],
    public availability: number,
    public performanceScore: number,
    public googleId?: string,
    public twoFASecret?: string,
    public isTwoFAEnabled: boolean = false,
    public resetToken?: string,
    public resetTokenExpiry?: Date,
    public passwordChangedAt?: Date,
    public emailVerified?: boolean,
    public emailVerificationToken?: string,
    public emailVerificationExpiry?: Date
  ) {}

  activate(): void {
    if (this.isActive) {
      throw new BadRequestException("User is already active");
    }
    this.isActive = true;
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new BadRequestException("User is already inactive");
    }
    this.isActive = false;
  }

  updatePassword(newPassword: string): void {
    this.password = newPassword;
    this.passwordChangedAt = new Date();
  }

  setResetToken(token: string, expiry: Date): void {
    this.resetToken = token;
    this.resetTokenExpiry = expiry;
  }

  clearResetToken(): void {
    this.resetToken = undefined;
    this.resetTokenExpiry = undefined;
  }

  setTwoFASecret(secret: string): void {
    this.twoFASecret = secret;
  }

  clearTwoFASecret(): void {
    this.twoFASecret = undefined;
  }

  enableTwoFA(): void {
    if (!this.twoFASecret) {
      throw new BadRequestException("2FA secret must be set before enabling 2FA");
    }
    this.isTwoFAEnabled = true;
  }

  disableTwoFA(): void {
    this.isTwoFAEnabled = false;
    this.twoFASecret = undefined;
  }
}
