import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class GoogleOAuthValidator {
  validateGoogleOAuthConfig(): void {
    const requiredVars = [
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_CALLBACK_URL",
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new BadRequestException(
        `Variables d'environnement Google OAuth manquantes: ${missingVars.join(", ")}. ` +
          "Veuillez configurer GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET et GOOGLE_CALLBACK_URL."
      );
    }
  }
}
