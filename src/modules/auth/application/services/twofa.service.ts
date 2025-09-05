import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { toDataURL } from "qrcode";
import { ConfigService } from "@nestjs/config";
import { AuthRepository } from "@modules/auth/domain/interfaces/auth-repository.interface";
import { OtpService } from "./otp.service";

@Injectable()
export class TwoFAService {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService
  ) {}

  async generateTwoFASecret(userId: string, email: string) {
    const secret = this.otpService.generateSecret();
    const otpauthUrl = this.otpService.generateOtpAuthUrl(email, secret);

    await this.authRepo.updateTwoFASecret(userId, secret);

    return {
      secret,
      qrCodeUrl: await toDataURL(otpauthUrl),
    };
  }

  async verifyTwoFACode(userId: string, code: string): Promise<boolean> {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.twoFASecret) {
      return false;
    }

    return this.otpService.verifyOtpCode(code, user.twoFASecret);
  }

  async enableTwoFA(userId: string, code: string): Promise<boolean> {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.twoFASecret) {
      throw new BadRequestException(
        "2FA secret not found. Please generate a secret first."
      );
    }

    const isValid = await this.verifyTwoFACode(userId, code);
    if (!isValid) {
      throw new BadRequestException("Invalid 2FA code");
    }

    await this.authRepo.updateTwoFAStatus(userId, true);
    return true;
  }

  async disableTwoFA(userId: string, code: string): Promise<boolean> {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.isTwoFAEnabled) {
      throw new BadRequestException("2FA is not enabled");
    }

    const isValid = await this.verifyTwoFACode(userId, code);
    if (!isValid) {
      throw new BadRequestException("Invalid 2FA code");
    }

    await this.authRepo.updateTwoFAStatus(userId, false);
    await this.authRepo.updateTwoFASecret(userId, null);
    return true;
  }

  async isTwoFAEnabled(userId: string): Promise<boolean> {
    const user = await this.authRepo.findById(userId);
    return user?.isTwoFAEnabled || false;
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const codes = this.otpService.generateBackupCodes();
    // Ici vous pourriez sauvegarder les codes de récupération en base
    // Pour l'instant, on les retourne simplement
    return codes;
  }
}
