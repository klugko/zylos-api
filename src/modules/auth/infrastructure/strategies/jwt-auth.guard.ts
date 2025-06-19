import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * @class JwtAuthGuard
 * @description Garde d'authentification basé sur la stratégie JWT.
 * Utilisé avec `@UseGuards(JwtAuthGuard)` sur les routes pour exiger une authentification JWT valide.
 * Si le token est invalide ou manquant, une `UnauthorizedException` sera levée.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const canActivate = (await super.canActivate(context)) as boolean;
    return canActivate;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user;
  }
}
