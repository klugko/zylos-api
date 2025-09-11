import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { AuthRepository } from "../../domain/interfaces/auth-repository.interface";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { ActivityLoggerService } from "@modules/activity-log/application/services/activity-logger.service";
import { ActivityAction } from "@modules/activity-log/domain/enums/activity.enums";

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject("AuthRepository") private readonly authRepo: AuthRepository,
    private readonly activityLogger: ActivityLoggerService
  ) {}

  async execute(
    userId: string,
    dto: UpdateProfileDto
  ): Promise<{ message: string; user: any }> {
    const user = await this.authRepo.findById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (dto.email && dto.email !== user.email) {
      const userWithEmail = await this.authRepo.findByEmail(dto.email);
      if (userWithEmail && userWithEmail.id !== userId) {
        throw new ConflictException("Email already in use");
      }
    }

    const oldValues = {
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      poste: user.poste,
      skills: user.skills,
      availability: user.availability,
      performanceScore: user.performanceScore,
    };

    user.updateFullProfile({
      fullname: dto.fullname,
      email: dto.email,
      phone: dto.phone,
      poste: dto.poste,
      skills: dto.skills,
      availability: dto.availability,
      performanceScore: dto.performanceScore,
    });

    const updatedUser = await this.authRepo.update(user);

    const changes = this.activityLogger.createChangeMetadata(oldValues, dto);

    await this.activityLogger.logUserAction(
      userId,
      ActivityAction.USER_UPDATED,
      `Profil de ${user.fullname} modifié`,
      `Modifications apportées au profil utilisateur`,
      changes
    );

    return {
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        fullname: updatedUser.fullname,
        email: updatedUser.email,
        phone: updatedUser.phone,
        poste: updatedUser.poste,
        avatarUrl: updatedUser.avatarUrl,
        skills: updatedUser.skills,
        availability: updatedUser.availability,
        performanceScore: updatedUser.performanceScore,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }
}
