import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class GoogleOAuthValidator {
  private readonly logger = new Logger(GoogleOAuthValidator.name);

  validateGoogleOAuthConfig(): void {
    const requiredVars = [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_CALLBACK_URL",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      this.logger.warn(
        `Variables d'environnement Google OAuth manquantes: ${missingVars.join(", ")}. ` +
          "Google OAuth sera désactivé jusqu'à ce que ces variables soient configurées."
      );
    } else {
      this.logger.log("Configuration Google OAuth validée avec succès");
    }
  }
}
