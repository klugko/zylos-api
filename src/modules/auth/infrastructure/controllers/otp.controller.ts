import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../strategies/jwt-auth.guard";
import { CurrentUser } from "../../application/decorators/current-user.decorator";
import { User } from "../../domain/entities/user.entity";
import { TwoFAService } from "../../application/services/twofa.service";
import {
  EnableTwoFADto,
  DisableTwoFADto,
  TwoFASetupResponseDto,
  TwoFAStatusResponseDto,
  LoginWithOtpDto,
  LoginResponseDto,
} from "../../application/dto/otp.dto";
import { LoginWithOtpUseCase } from "../../application/use-cases/login-with-otp.use-case";

@ApiTags("OTP & 2FA")
@Controller("api/v1/otp")
export class OtpController {
  constructor(
    private readonly twoFAService: TwoFAService,
    private readonly loginWithOtpUseCase: LoginWithOtpUseCase
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connexion avec vérification OTP" })
  @ApiBody({ type: LoginWithOtpDto })
  @ApiResponse({
    status: 200,
    description: "Connexion réussie",
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: "Identifiants invalides" })
  @ApiResponse({ status: 400, description: "Code OTP invalide" })
  async loginWithOtp(@Body() dto: LoginWithOtpDto): Promise<LoginResponseDto> {
    return this.loginWithOtpUseCase.execute(dto);
  }

  @Post("2fa/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Configurer le 2FA pour un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "2FA configuré avec succès",
    type: TwoFASetupResponseDto,
  })
  async setupTwoFA(@CurrentUser() user: User): Promise<TwoFASetupResponseDto> {
    const { secret, qrCodeUrl } = await this.twoFAService.generateTwoFASecret(
      user.id,
      user.email
    );
    const backupCodes = await this.twoFAService.generateBackupCodes(user.id);

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Activer le 2FA" })
  @ApiBody({ type: EnableTwoFADto })
  @ApiResponse({ status: 200, description: "2FA activé avec succès" })
  @ApiResponse({ status: 400, description: "Code 2FA invalide" })
  async enableTwoFA(
    @CurrentUser() user: User,
    @Body() dto: EnableTwoFADto
  ): Promise<{ message: string }> {
    await this.twoFAService.enableTwoFA(user.id, dto.code);
    return { message: "2FA activé avec succès" };
  }

  @Post("2fa/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Désactiver le 2FA" })
  @ApiBody({ type: DisableTwoFADto })
  @ApiResponse({ status: 200, description: "2FA désactivé avec succès" })
  @ApiResponse({ status: 400, description: "Code 2FA invalide" })
  async disableTwoFA(
    @CurrentUser() user: User,
    @Body() dto: DisableTwoFADto
  ): Promise<{ message: string }> {
    await this.twoFAService.disableTwoFA(user.id, dto.code);
    return { message: "2FA désactivé avec succès" };
  }

  @Get("2fa/status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Vérifier le statut du 2FA" })
  @ApiResponse({
    status: 200,
    description: "Statut du 2FA",
    type: TwoFAStatusResponseDto,
  })
  async getTwoFAStatus(
    @CurrentUser() user: User
  ): Promise<TwoFAStatusResponseDto> {
    const isEnabled = await this.twoFAService.isTwoFAEnabled(user.id);
    const isSetup = !!user.twoFASecret;

    return {
      isEnabled,
      isSetup,
    };
  }

  @Post("2fa/verify")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Vérifier un code OTP" })
  @ApiBody({ type: EnableTwoFADto })
  @ApiResponse({ status: 200, description: "Code OTP valide" })
  @ApiResponse({ status: 400, description: "Code OTP invalide" })
  async verifyOtp(
    @CurrentUser() user: User,
    @Body() dto: EnableTwoFADto
  ): Promise<{ message: string; valid: boolean }> {
    const isValid = await this.twoFAService.verifyTwoFACode(user.id, dto.code);

    if (!isValid) {
      throw new BadRequestException("Code OTP invalide");
    }

    return { message: "Code OTP valide", valid: true };
  }
}
