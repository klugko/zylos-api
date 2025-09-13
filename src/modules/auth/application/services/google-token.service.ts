import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleTokenService {
  private readonly client: OAuth2Client;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('GOOGLE_CLIENT_ID is required');
    }
    this.client = new OAuth2Client(clientId);
  }

  /**
   * Vérifie l'ID Token (Google Identity Services) et retourne le payload.
   * Si `expectedNonce` est fourni, on le compare au claim "nonce" du token.
   */
  async verifyIdToken(idToken: string, expectedNonce?: string): Promise<TokenPayload> {
    if (!idToken) throw new BadRequestException('Missing Google ID token');

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('Invalid Google token');

      if (!payload.email || !payload.email_verified) {
        throw new UnauthorizedException('Google account email not verified');
      }

      if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
        throw new UnauthorizedException('Invalid Google token nonce');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Failed to verify Google token');
    }
  }
}
