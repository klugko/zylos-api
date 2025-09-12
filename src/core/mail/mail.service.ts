import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: this.configService.get<string>("MAIL_SECURE") === "true",
      auth: {
        user: this.configService.get("MAIL_USER"),
        pass: this.configService.get("MAIL_PASS"),
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 60000, // 60 secondes
      greetingTimeout: 30000, // 30 secondes
      socketTimeout: 60000, // 60 secondes
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 20000,
      rateLimit: 5,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    fullname: string
  ): Promise<void> {
    const resetUrl = `${this.configService.get("APP_URL")}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>("SUPPORT_EMAIL"),
      to: email,
      subject: "Réinitialisation de votre mot de passe - Zylos AI",
      html: `
        <p>Bonjour ${fullname},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p>
        <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
        <p>Ce lien expirera dans 24 heures.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de reset envoyé à ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email reset à ${email}`, error.stack);
      throw new InternalServerErrorException(
        "Impossible d'envoyer l'email de réinitialisation"
      );
    }
  }

  async sendEmailVerificationEmail(
    email: string,
    fullname: string,
    verificationUrl: string
  ): Promise<void> {
    // Test de connexion avant envoi
    await this.verifyConnection();

    const mailOptions = {
      from: this.configService.get<string>("SUPPORT_EMAIL"),
      to: email,
      subject: "Vérifiez votre adresse email - NexaFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Bienvenue sur NexaFlow !</h2>
          <p>Bonjour ${fullname},</p>
          <p>Merci de vous être inscrit sur NexaFlow. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Vérifier mon email
            </a>
          </div>
          
          <p>Ou copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          
          <p><strong>Ce lien expirera dans 24 heures.</strong></p>
          
          <p>Si vous n'avez pas créé de compte sur NexaFlow, veuillez ignorer cet email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.
          </p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de vérification envoyé à ${email}: ${info.messageId}`
      );
    } catch (error) {
      this.logger.error(
        `Erreur envoi email de vérification à ${email}: ${error.message}`,
        error.stack
      );

      // Log des détails de configuration pour debug
      this.logger.error(
        `Configuration SMTP: Host=${this.configService.get("MAIL_HOST")}, Port=${this.configService.get("MAIL_PORT")}, User=${this.configService.get("MAIL_USER")}`
      );

      throw new InternalServerErrorException(
        "Impossible d'envoyer l'email de vérification"
      );
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log("Connexion SMTP vérifiée avec succès");
    } catch (error) {
      this.logger.error(`Échec de la vérification SMTP: ${error.message}`);
      throw new InternalServerErrorException("Service de mail indisponible");
    }
  }
}
