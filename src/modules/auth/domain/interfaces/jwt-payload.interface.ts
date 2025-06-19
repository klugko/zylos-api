
/**
 * @interface JwtPayload
 * @description Définit la structure des données contenues dans le payload du token JWT
 * @property {string} sub - L'identifiant unique de l'utilisateur (subject).
 * @property {string} email - L'adresse email de l'utilisateur.
 * @property {string} role - Le rôle de l'utilisateur (ex: 'ADMIN', 'USER', 'MANAGER').
 */
export interface JwtPayload {
    fullname: string;
    sub: string; // User ID
    email: string;
    role: string; // UserRole as string
  }
  