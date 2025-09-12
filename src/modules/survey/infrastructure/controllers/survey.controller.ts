import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";
import { CurrentUser } from "@core/common/current-user.decorator";
import { User } from "@modules/auth/domain/entities/user.entity";
import { CreateSurveyUseCase } from "../../application/use-cases/create-survey.use-case";
import { GetSurveysUseCase } from "../../application/use-cases/get-surveys.use-case";
import { GetSurveyUseCase } from "../../application/use-cases/get-survey.use-case";
import { UpdateSurveyUseCase } from "../../application/use-cases/update-survey.use-case";
import { DeleteSurveyUseCase } from "../../application/use-cases/delete-survey.use-case";
import { ChangeSurveyStatusUseCase } from "../../application/use-cases/change-survey-status.use-case";
import { CreateSurveyDto } from "../../application/dto/create-survey.dto";
import { UpdateSurveyDto } from "../../application/dto/update-survey.dto";
import { GetSurveysDto } from "../../application/dto/survey-query.dto";
import { SurveyResponseDto } from "../../application/dto/survey-response.dto";
import { SurveyStatus } from "../../domain/enums/survey.enums";

@ApiTags("Sondages et Votes")
@Controller("api/v1/surveys")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class SurveyController {
  constructor(
    private readonly createSurveyUseCase: CreateSurveyUseCase,
    private readonly getSurveysUseCase: GetSurveysUseCase,
    private readonly getSurveyUseCase: GetSurveyUseCase,
    private readonly updateSurveyUseCase: UpdateSurveyUseCase,
    private readonly deleteSurveyUseCase: DeleteSurveyUseCase,
    private readonly changeSurveyStatusUseCase: ChangeSurveyStatusUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: "Créer un nouveau sondage" })
  @ApiResponse({ status: 201, description: "Sondage créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async create(
    @Body() dto: CreateSurveyDto,
    @CurrentUser() user: User
  ): Promise<SurveyResponseDto> {
    const survey = await this.createSurveyUseCase.execute(dto, user.id);
    return this.getSurveyUseCase.execute(survey.id);
  }

  @Get()
  @ApiOperation({ summary: "Lister les sondages" })
  @ApiResponse({ status: 200, description: "Liste des sondages" })
  @ApiQuery({ name: "projectId", required: false, description: "ID du projet" })
  @ApiQuery({ name: "taskId", required: false, description: "ID de la tâche" })
  @ApiQuery({
    name: "status",
    required: false,
    description: "Statut du sondage",
  })
  @ApiQuery({ name: "type", required: false, description: "Type de sondage" })
  @ApiQuery({
    name: "search",
    required: false,
    description: "Recherche textuelle",
  })
  @ApiQuery({ name: "page", required: false, description: "Numéro de page" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre d'éléments par page",
  })
  async getSurveys(@Query() query: GetSurveysDto): Promise<{
    surveys: SurveyResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.getSurveysUseCase.execute(query);
    return {
      ...result,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtenir un sondage par ID" })
  @ApiResponse({ status: 200, description: "Détails du sondage" })
  @ApiResponse({ status: 404, description: "Sondage introuvable" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async getSurvey(@Param("id") id: string): Promise<SurveyResponseDto> {
    return this.getSurveyUseCase.execute(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Modifier un sondage" })
  @ApiResponse({ status: 200, description: "Sondage modifié avec succès" })
  @ApiResponse({ status: 404, description: "Sondage introuvable" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSurveyDto,
    @CurrentUser() user: User
  ): Promise<SurveyResponseDto> {
    await this.updateSurveyUseCase.execute(id, dto, user.id);
    return this.getSurveyUseCase.execute(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Supprimer un sondage" })
  @ApiResponse({ status: 204, description: "Sondage supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Sondage introuvable" })
  @ApiResponse({
    status: 400,
    description: "Impossible de supprimer ce sondage",
  })
  @ApiParam({ name: "id", description: "ID du sondage" })
  async delete(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<void> {
    await this.deleteSurveyUseCase.execute(id, user.id);
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Changer le statut d'un sondage" })
  @ApiResponse({ status: 200, description: "Statut modifié avec succès" })
  @ApiResponse({ status: 404, description: "Sondage introuvable" })
  @ApiResponse({ status: 400, description: "Transition de statut invalide" })
  @ApiParam({ name: "id", description: "ID du sondage" })
  @ApiBody({
    description: "Nouveau statut du sondage",
    schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"],
          description: "Statut du sondage",
          example: "ACTIVE",
        },
      },
      required: ["status"],
    },
  })
  async changeStatus(
    @Param("id") id: string,
    @Body("status") status: SurveyStatus,
    @CurrentUser() user: User
  ): Promise<{ message: string }> {
    await this.changeSurveyStatusUseCase.execute(id, status, user.id);
    return { message: "Statut modifié avec succès" };
  }
}
