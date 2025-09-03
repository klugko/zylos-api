/**
 * @interface JwtPayload
 * @description Définit la structure des données contenues dans le payload du token JWT
 * @property {string} sub - L'identifiant unique de l'utilisateur (subject).
 * @property {string} email - L'adresse email de l'utilisateur.
 * @property {string} role - Le rôle de l'utilisateur (ex: 'ADMIN', 'USER', 'MANAGER').
 * @property {number} iat - Timestamp d'émission du token (issued at).
 * @property {number} exp - Timestamp d'expiration du token (expiration time).
 */

export interface JwtPayload {
  fullname: string;
  sub: string; 
  email: string;
  role: string; 
  iat?: number; 
  exp?: number;
}