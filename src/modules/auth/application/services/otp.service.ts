import { Injectable } from "@nestjs/common";
import { authenticator } from "otplib";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OtpService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Génère un code OTP de 6 chiffres
   */
  generateOtpCode(secret: string): string {
    return authenticator.generate(secret);
  }

  /**
   * Génère un secret pour l'authentificateur
   */
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Vérifie un code OTP avec un secret
   */
  verifyOtpCode(token: string, secret: string): boolean {
    return authenticator.verify({
      token,
      secret,
    });
  }

  /**
   * Génère une URL d'authentification pour QR code
   */
  generateOtpAuthUrl(email: string, secret: string): string {
    const appName = this.configService.get("APP_NAME", "NEXA API");
    return authenticator.keyuri(email, appName, secret);
  }

  /**
   * Génère un code de récupération (backup codes)
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(this.generateRandomCode(8));
    }
    return codes;
  }

  /**
   * Génère un code aléatoire de longueur donnée
   */
  private generateRandomCode(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
