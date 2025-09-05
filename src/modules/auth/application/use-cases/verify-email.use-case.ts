import { Injectable } from "@nestjs/common";
import { EmailVerificationService } from "../services/email-verification.service";
import { VerifyEmailDto } from "../dto/verify-email.dto";

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly emailVerificationService: EmailVerificationService
  ) {}

  async execute(dto: VerifyEmailDto): Promise<{ message: string }> {
    const { token } = dto;

    // Vérifier l'email avec le token
    await this.emailVerificationService.verifyEmail(token);

    return {
      message: "Email verified successfully",
    };
  }
}
