import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Inject,
  BadRequestException,
} from "@nestjs/common";
import { LoginWithOtpDto, LoginResponseDto } from "../dto/otp.dto";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { TwoFAService } from "../services/twofa.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class LoginWithOtpUseCase {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly twoFAService: TwoFAService
  ) {}

  async execute(dto: LoginWithOtpDto): Promise<LoginResponseDto> {
    const user = await this.authRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new ForbiddenException("User account is deactivated");
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Vérifier si l'utilisateur a activé le 2FA
    if (user.isTwoFAEnabled) {
      if (!dto.otpCode) {
        return {
          accessToken: "",
          requiresOtp: true,
          message: "2FA verification required. Please provide OTP code.",
        };
      }

      // Vérifier le code OTP
      const isOtpValid = await this.twoFAService.verifyTwoFACode(
        user.id,
        dto.otpCode
      );
      if (!isOtpValid) {
        throw new UnauthorizedException("Invalid OTP code");
      }
    }

    // Générer le token JWT
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
      requiresOtp: false,
      message: "Login successful",
    };
  }
}
