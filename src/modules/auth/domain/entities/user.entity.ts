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
    public avatarUrl?: string,
    public phone?: string,
    public poste?: string,
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

  updateAvatar(avatarUrl: string): void {
    this.avatarUrl = avatarUrl;
  }

  removeAvatar(): void {
    this.avatarUrl = undefined;
  }

  updateProfile(phone?: string, poste?: string): void {
    if (phone !== undefined) this.phone = phone;
    if (poste !== undefined) this.poste = poste;
  }

  updateFullProfile(data: {
    fullname?: string;
    email?: string;
    phone?: string;
    poste?: string;
    skills?: string[];
    availability?: number;
    performanceScore?: number;
  }): void {
    if (data.fullname !== undefined) this.fullname = data.fullname;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.poste !== undefined) this.poste = data.poste;
    if (data.skills !== undefined) this.skills = data.skills;
    if (data.availability !== undefined) this.availability = data.availability;
    if (data.performanceScore !== undefined) this.performanceScore = data.performanceScore;
  }
}
