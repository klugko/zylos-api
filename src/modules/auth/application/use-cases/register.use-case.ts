import { Injectable, ConflictException, Inject } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { EmailVerificationService } from "../services/email-verification.service";
import * as bcrypt from "bcrypt";
import { User } from "../../domain/entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../../domain/enums/user-role.enum";

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly emailVerificationService: EmailVerificationService
  ) {}

  async execute(dto: RegisterDto): Promise<Omit<User, "password">> {
    const existing = await this.authRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new User(
      uuidv4(),
      dto.fullname,
      dto.email,
      hashedPassword,
      dto.role,
      true,
      now,
      now,
      dto.skills ?? [],
      dto.availability ?? 0,
      dto.performanceScore ?? 0.0,
      undefined, // googleId
      undefined, // avatarUrl
      dto.phone, // phone
      dto.poste, // poste
      undefined, // twoFASecret
      false, // isTwoFAEnabled - par défaut false
      undefined, // resetToken
      undefined, // resetTokenExpiry
      undefined, // passwordChangedAt
      false // emailVerified - par défaut false
    );

    const saved = await this.authRepo.create(user);

    // Envoyer l'email de vérification
    try {
      await this.emailVerificationService.sendVerificationEmail(
        saved.id,
        saved.email,
        saved.fullname
      );
    } catch (error) {
      // Log l'erreur mais ne pas faire échouer l'inscription
      console.error("Failed to send verification email:", error);
    }

    return new User(
      saved.id,
      saved.fullname,
      saved.email,
      undefined,
      saved.role,
      saved.isActive,
      saved.createdAt,
      saved.updatedAt,
      saved.skills,
      saved.availability,
      saved.performanceScore,
      undefined, // googleId
      undefined, // avatarUrl
      saved.phone, // phone
      saved.poste, // poste
      undefined, // twoFASecret
      false, // isTwoFAEnabled - par défaut false
      undefined, // resetToken
      undefined, // resetTokenExpiry
      undefined, // passwordChangedAt
      saved.emailVerified
    );
  }
}
