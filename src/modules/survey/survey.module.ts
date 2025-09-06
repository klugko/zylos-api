import { Module } from "@nestjs/common";
import { PrismaService } from "@core/prisma/prisma.service";
import { SurveyController } from "./infrastructure/controllers/survey.controller";
import { VoteController } from "./infrastructure/controllers/vote.controller";

// Repositories
import { PrismaSurveyRepository } from "./infrastructure/repositories/prisma-survey.repository";
import { PrismaSurveyOptionRepository } from "./infrastructure/repositories/prisma-survey-option.repository";
import { PrismaVoteRepository } from "./infrastructure/repositories/prisma-vote.repository";
import { PrismaSurveyResultsRepository } from "./infrastructure/repositories/prisma-survey-results.repository";

// Use Cases
import { CreateSurveyUseCase } from "./application/use-cases/create-survey.use-case";
import { GetSurveysUseCase } from "./application/use-cases/get-surveys.use-case";
import { GetSurveyUseCase } from "./application/use-cases/get-survey.use-case";
import { UpdateSurveyUseCase } from "./application/use-cases/update-survey.use-case";
import { DeleteSurveyUseCase } from "./application/use-cases/delete-survey.use-case";
import { VoteUseCase } from "./application/use-cases/vote.use-case";
import { VoteMultipleUseCase } from "./application/use-cases/vote-multiple.use-case";
import { GetSurveyResultsUseCase } from "./application/use-cases/get-survey-results.use-case";
import { ChangeSurveyStatusUseCase } from "./application/use-cases/change-survey-status.use-case";
import { ActivityLogModule } from "@modules/activity-log/activity-log.module";

@Module({
  imports: [ActivityLogModule],
  controllers: [SurveyController, VoteController],
  providers: [
    PrismaService,
    // Repositories
    {
      provide: "SurveyRepository",
      useClass: PrismaSurveyRepository,
    },
    {
      provide: "SurveyOptionRepository",
      useClass: PrismaSurveyOptionRepository,
    },
    {
      provide: "VoteRepository",
      useClass: PrismaVoteRepository,
    },
    {
      provide: "SurveyResultsRepository",
      useClass: PrismaSurveyResultsRepository,
    },
    // Use Cases
    CreateSurveyUseCase,
    GetSurveysUseCase,
    GetSurveyUseCase,
    UpdateSurveyUseCase,
    DeleteSurveyUseCase,
    VoteUseCase,
    VoteMultipleUseCase,
    GetSurveyResultsUseCase,
    ChangeSurveyStatusUseCase,
  ],
  exports: [
    "SurveyRepository",
    "SurveyOptionRepository",
    "VoteRepository",
    "SurveyResultsRepository",
  ],
})
export class SurveyModule {}
