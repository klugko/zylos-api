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
    const invitationUrl = `${this.configService.get('APP_URL', 'https://zylos-ai.netlify.app')}/auth/accept-invitation?token=${token}`;
    const logoUrl = this.configService.get('COMPANY_LOGO_URL', 'https://nexa-api-v2.monambassadeur.com/uploads/logo_zylos.jpeg');
    const appName = this.configService.get('APP_NAME', 'Zylos AI');
    const supportEmail = this.configService.get('SUPPORT_EMAIL', 'support@monambassadeur.com');

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation à ${projectName}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333333;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  background-color: #ffffff;
                  border-bottom: 1px solid #eeeeee;
              }
              .logo {
                  max-width: 180px;
                  height: auto;
              }
              .content {
                  background: #ffffff;
                  padding: 30px;
                  border-radius: 5px;
                  margin-top: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
              }
              .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #0066ff;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 4px;
                  margin: 20px 0;
                  font-weight: bold;
              }
              .footer {
                  text-align: center;
                  margin-top: 30px;
                  color: #666666;
                  font-size: 12px;
              }
              .warning {
                  background-color: #fff8e6;
                  padding: 10px;
                  border-left: 4px solid #ffc107;
                  margin: 15px 0;
                  border-radius: 3px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="${logoUrl}" alt="${appName} Logo" class="logo">
              </div>
              
              <div class="content">
                  <h2>Invitation à rejoindre ${appName}</h2>
                  
                  <p>Bonjour,</p>
                  
                  <p><strong>${invitedBy}</strong> vous invite à rejoindre le projet 
                  <strong>${projectName}</strong> sur la plateforme ${appName}.</p>
                  
                  <p>Pour accepter cette invitation, cliquez sur le bouton ci-dessous :</p>
                  
                  <p style="text-align: center;">
                      <a href="${invitationUrl}" class="button">Accepter l'invitation</a>
                  </p>
                  
                  <div class="warning">
                      <p><strong>Important:</strong> Ce lien expirera automatiquement dans 7 jours.</p>
                  </div>
                  
                  <p>Si vous ne souhaitez pas rejoindre ce projet ou si vous pensez avoir reçu cet email par erreur, 
                  veuillez simplement ignorer ce message.</p>
                  
                  <p>Pour toute question, n'hésitez pas à contacter notre équipe de support à l'adresse 
                  <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
                  
                  <p>Cordialement,<br>L'équipe ${appName}</p>
              </div>
              
              <div class="footer">
                  <p>© ${new Date().getFullYear()} ${appName}. Tous droits réservés.</p>
              </div>
          </div>
      </body>
      </html>
          `;

    const mailOptions = {
      from: this.configService.get<string>('SUPPORT_EMAIL'),
      to: email,
      subject: `Invitation à rejoindre ${projectName} - ${appName}`,
      html: emailTemplate,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Invitation envoyée à ${email}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur envoi invitation à ${email}`, error.stack);
      throw new InternalServerErrorException('Impossible d\'envoyer l\'email d\'invitation');
    }
  }
}