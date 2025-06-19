import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../domain/interfaces/jwt-payload.interface';
import { User } from '../../domain/entities/user.entity';

/**
 * @class JwtStrategy
 * @description Stratégie Passport pour l'authentification JWT.
 * Elle extrait le token du header de la requête (Bearer Token),
 * le valide et retourne le payload utilisateur.
 *
 * @param {string} process.env.JWT_SECRET - Clé secrète utilisée pour valider la signature du token.
 * DOIT ÊTRE DÉFINIE dans votre fichier `.env`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET n\'est pas défini dans les variables d\'environnement.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    if (!payload || !payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Payload JWT invalide.');
    }

    const user = new User(
      payload.sub,
      '',
      payload.email,
      undefined,
      payload.role as any,
      true,
      new Date(),
      new Date(),
      [],
      0,
      0,
      undefined,
    );

    return user;
  }
}
