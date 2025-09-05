import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailVerificationRepository } from "../../domain/interfaces/email-verification-repository.interface";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { EmailVerification } from "../../domain/entities/email-verification.entity";
import { MailService } from "@core/mail/mail.service";

@Injectable()
export class EmailVerificationService {
  constructor(
    @Inject("EmailVerificationRepository")
    private readonly emailVerificationRepo: EmailVerificationRepository,
    @Inject("AuthRepository")
    private readonly authRepo: AuthRepository,
    private readonly mailService: MailService,
    private readonly configService: ConfigService
  ) {}

  async generateVerificationToken(
    userId: string,
    email: string
  ): Promise<string> {
    // Supprimer les anciens tokens pour cet utilisateur
    await this.emailVerificationRepo.deleteByUserId(userId);

    // Générer un nouveau token
    const token = this.generateRandomToken();
    const emailVerification = EmailVerification.create(
      userId,
      email,
      token,
      24
    ); // 24 heures

    // Sauvegarder le token
    await this.emailVerificationRepo.create(emailVerification);

    return token;
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    fullname: string
  ): Promise<void> {
    const token = await this.generateVerificationToken(userId, email);
    const verificationUrl = `${this.configService.get("APP_URL")}/auth/verify-email?token=${token}`;

    await this.mailService.sendEmailVerificationEmail(
      email,
      fullname,
      verificationUrl
    );
  }

  async verifyEmail(token: string): Promise<void> {
    const emailVerification =
      await this.emailVerificationRepo.findByToken(token);

    if (!emailVerification) {
      throw new NotFoundException("Invalid verification token");
    }

    if (!emailVerification.isValid()) {
      throw new BadRequestException(
        "Verification token is expired or already used"
      );
    }

    // Marquer le token comme utilisé
    emailVerification.markAsUsed();
    await this.emailVerificationRepo.update(emailVerification);

    // Mettre à jour l'utilisateur
    await this.authRepo.updateEmailVerificationStatus(
      emailVerification.userId,
      true
    );
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.authRepo.findByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.emailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    await this.sendVerificationEmail(user.id, user.email, user.fullname);
  }

  private generateRandomToken(): string {
    return crypto.randomUUID() + "-" + Date.now().toString(36);
  }

  async cleanupExpiredTokens(): Promise<void> {
    await this.emailVerificationRepo.deleteExpiredTokens();
  }
}
