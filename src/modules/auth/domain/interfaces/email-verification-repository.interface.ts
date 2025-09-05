import { EmailVerification } from "../entities/email-verification.entity";

export interface EmailVerificationRepository {
  create(emailVerification: EmailVerification): Promise<EmailVerification>;
  findByToken(token: string): Promise<EmailVerification | null>;
  findByUserId(userId: string): Promise<EmailVerification | null>;
  update(emailVerification: EmailVerification): Promise<EmailVerification>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<void>;
}
