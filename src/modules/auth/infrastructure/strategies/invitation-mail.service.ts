import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class InvitationMailService {
  private readonly logger = new Logger(InvitationMailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<string>('MAIL_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendInvitationEmail(email: string, token: string, invitedBy: string, projectName: string): Promise<void> {
    const invitationUrl = `${this.configService.get('APP_URL')}/auth/accept-invitation?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('SUPPORT_EMAIL'),
      to: email,
      subject: `Invitation à rejoindre ${projectName} - Zylos AI`,
      html: `
        <p>Bonjour,</p>
        <p>${invitedBy} vous a invité à rejoindre le projet <strong>${projectName}</strong> sur la plateforme Zylos AI.</p>
        <p>Cliquez sur le lien ci-dessous pour accepter l’invitation :</p>
        <a href="${invitationUrl}">Accepter l’invitation</a>
        <p>⚠️ Ce lien expirera dans 7 jours.</p>
        <p>Si vous n’êtes pas à l’origine de cette invitation, ignorez cet email.</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation envoyée à ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur envoi invitation à ${email}`, error.stack);
      throw new InternalServerErrorException('Impossible d’envoyer l’email d’invitation');
    }
  }
}
