import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { SendEmailVerificationUseCase } from "../../application/use-cases/send-email-verification.use-case";
import { VerifyEmailUseCase } from "../../application/use-cases/verify-email.use-case";
import { SendEmailVerificationDto } from "../../application/dto/send-email-verification.dto";
import { VerifyEmailDto } from "../../application/dto/verify-email.dto";

@ApiTags("Email Verification")
@Controller("api/v1/auth/email-verification")
export class EmailVerificationController {
  constructor(
    private readonly sendEmailVerificationUC: SendEmailVerificationUseCase,
    private readonly verifyEmailUC: VerifyEmailUseCase
  ) {}

  @Post("send")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Envoyer un email de vérification" })
  @ApiBody({ type: SendEmailVerificationDto })
  @ApiResponse({ status: 200, description: "Email de vérification envoyé" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  @ApiResponse({ status: 400, description: "Email déjà vérifié" })
  async sendVerificationEmail(@Body() dto: SendEmailVerificationDto) {
    return this.sendEmailVerificationUC.execute(dto);
  }

  @Get("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Vérifier un email avec un token" })
  @ApiQuery({ name: "token", description: "Token de vérification email" })
  @ApiResponse({ status: 200, description: "Email vérifié avec succès" })
  @ApiResponse({ status: 400, description: "Token invalide ou expiré" })
  @ApiResponse({ status: 404, description: "Token non trouvé" })
  async verifyEmail(@Query("token") token: string) {
    const dto: VerifyEmailDto = { token };
    return this.verifyEmailUC.execute(dto);
  }
}
