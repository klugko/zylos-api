import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { EmailVerificationService } from "../services/email-verification.service";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { SendEmailVerificationDto } from "../dto/send-email-verification.dto";

@Injectable()
export class SendEmailVerificationUseCase {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
    @Inject("AuthRepository")
    private readonly authRepo: AuthRepository
  ) {}

  async execute(dto: SendEmailVerificationDto): Promise<{ message: string }> {
    const { email } = dto;

    // Vérifier si l'utilisateur existe
    const user = await this.authRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    // Envoyer l'email de vérification
    await this.emailVerificationService.sendVerificationEmail(
      user.id,
      user.email,
      user.fullname
    );

    return {
      message: "Verification email sent successfully. Please check your inbox.",
    };
  }
}
