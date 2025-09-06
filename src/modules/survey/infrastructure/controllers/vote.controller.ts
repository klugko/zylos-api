import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";
import { CurrentUser } from "@core/common/current-user.decorator";
import { User } from "@modules/auth/domain/entities/user.entity";
import { VoteUseCase } from "../../application/use-cases/vote.use-case";
import { VoteMultipleUseCase } from "../../application/use-cases/vote-multiple.use-case";
import { GetSurveyResultsUseCase } from "../../application/use-cases/get-survey-results.use-case";
import {
  CreateVoteDto,
  CreateMultipleVotesDto,
} from "../../application/dto/vote.dto";
import {
  VoteResponseDto,
  SurveyResultsResponseDto,
} from "../../application/dto/survey-response.dto";

@ApiTags("Votes")
@Controller("api/v1/surveys")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class VoteController {
  constructor(
    private readonly voteUseCase: VoteUseCase,
    private readonly voteMultipleUseCase: VoteMultipleUseCase,
    private readonly getSurveyResultsUseCase: GetSurveyResultsUseCase
  ) {}

  @Post(":id/vote")
  @ApiOperation({ summary: "Voter pour une option" })
  @ApiResponse({ status: 201, description: "Vote enregistré avec succès" })
  @ApiResponse({ status: 400, description: "Vote invalide" })
  @ApiResponse({ status: 404, description: "Sondage ou option introuvable" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async vote(
    @Param("id") surveyId: string,
    @Body() dto: CreateVoteDto,
    @CurrentUser() user: User
  ): Promise<VoteResponseDto> {
    const vote = await this.voteUseCase.execute(surveyId, dto, user.id);
    return {
      id: vote.id,
      optionId: vote.optionId,
      voterId: vote.isAnonymous ? undefined : vote.voterId,
      weight: vote.weight,
      comment: vote.comment,
      isAnonymous: vote.isAnonymous,
      createdAt: vote.createdAt,
    };
  }

  @Post(":id/vote-multiple")
  @ApiOperation({ summary: "Voter pour plusieurs options" })
  @ApiResponse({ status: 201, description: "Votes enregistrés avec succès" })
  @ApiResponse({ status: 400, description: "Votes invalides" })
  @ApiResponse({ status: 404, description: "Sondage ou options introuvables" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async voteMultiple(
    @Param("id") surveyId: string,
    @Body() dto: CreateMultipleVotesDto,
    @CurrentUser() user: User
  ): Promise<VoteResponseDto[]> {
    const votes = await this.voteMultipleUseCase.execute(
      surveyId,
      dto,
      user.id
    );
    return votes.map((vote) => ({
      id: vote.id,
      optionId: vote.optionId,
      voterId: vote.isAnonymous ? undefined : vote.voterId,
      weight: vote.weight,
      comment: vote.comment,
      isAnonymous: vote.isAnonymous,
      createdAt: vote.createdAt,
    }));
  }

  @Get(":id/results")
  @ApiOperation({ summary: "Obtenir les résultats d'un sondage" })
  @ApiResponse({ status: 200, description: "Résultats du sondage" })
  @ApiResponse({ status: 404, description: "Sondage introuvable" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async getResults(
    @Param("id") surveyId: string
  ): Promise<SurveyResultsResponseDto> {
    return this.getSurveyResultsUseCase.execute(surveyId);
  }
}
