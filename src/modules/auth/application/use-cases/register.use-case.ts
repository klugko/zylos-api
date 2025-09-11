import { Injectable, ConflictException, Inject } from "@nestjs/common";
import { RegisterDto } from "../dto/register.dto";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { EmailVerificationService } from "../services/email-verification.service";
import { RegistrationEvaluationService } from "../../infrastructure/services/registration-evaluation.service";
import { EvolvingScoringService } from "../../infrastructure/services/evolving-scoring.service";
import * as bcrypt from "bcrypt";
import { User } from "../../domain/entities/user.entity";
import { v4 as uuidv4 } from "uuid";
import { UserRole } from "../../domain/enums/user-role.enum";

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly registrationEvaluationService: RegistrationEvaluationService,
    private readonly evolvingScoringService: EvolvingScoringService
  ) {}

  async execute(dto: RegisterDto): Promise<Omit<User, "password">> {
    const existing = await this.authRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException("Email already in use");
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const evaluationResult = await this.registrationEvaluationService.evaluateRegistration(
      dto.fullname,
      dto.email,
      dto.password,
      dto.role
    );

    const initialScores = this.evolvingScoringService.calculateInitialScores(evaluationResult);

    const user = new User(
      uuidv4(),
      dto.fullname,
      dto.email,
      hashedPassword,
      dto.role,
      true,
      now,
      now,
      [],
      initialScores.availability,
      initialScores.performanceScore,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      false
    );

    const saved = await this.authRepo.create(user);

    try {
      await this.emailVerificationService.sendVerificationEmail(
        saved.id,
        saved.email,
        saved.fullname
      );
    } catch (error) {
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
      undefined,
      undefined,
      saved.phone,
      saved.poste,
      undefined,
      false,
      undefined,
      undefined,
      undefined,
      saved.emailVerified
    );
  }
}
