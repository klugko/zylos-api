import { User } from '../entities/user.entity';

export interface AuthRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findAllActive(): Promise<User[]>;
  validateUser(email: string, password: string): Promise<User | null>;
  findAllWithFilters(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: User[]; total: number }>;

  updateResetToken(userId: string, resetToken: string, resetTokenExpiry: Date): Promise<void>;
  findByResetToken(token: string): Promise<User | null>;
  clearResetToken(userId: string): Promise<void>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  
  updateTwoFASecret(userId: string, secret: string | null): Promise<void>;
  
  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  isRefreshTokenRevoked(token: string): Promise<boolean>;
  revokeRefreshToken(token: string): Promise<void>;
  revokeAllUserRefreshTokens(userId: string): Promise<void>;
}
