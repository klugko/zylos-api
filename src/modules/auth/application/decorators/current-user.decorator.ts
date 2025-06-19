import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Chemin d'importation vers l'entité User (relative au module auth)
import { User } from '../../domain/entities/user.entity';

/**
 * @decorator CurrentUser
 * @description Décorateur de paramètre personnalisé pour extraire l'utilisateur authentifié
 * de l'objet `request`. Cet utilisateur est attaché par `Passport` après
 * une validation réussie de la stratégie JWT (via `JwtAuthGuard`).
 * @returns {User} L'objet utilisateur authentifié.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
