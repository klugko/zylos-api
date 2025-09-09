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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateCustomStatusUseCase } from "../../application/use-cases/create-custom-status.use-case";
import { UpdateCustomStatusUseCase } from "../../application/use-cases/update-custom-status.use-case";
import { GetCustomStatusesUseCase } from "../../application/use-cases/get-custom-statuses.use-case";
import { InitializeDefaultStatusesUseCase } from "../../application/use-cases/initialize-default-statuses.use-case";
import { CreateCustomStatusDto } from "../../application/dto/create-custom-status.dto";
import { UpdateCustomStatusDto } from "../../application/dto/update-custom-status.dto";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";

@ApiTags("Custom Statuses")
@ApiBearerAuth("JWT-auth")
@Controller("api/v1/custom-statuses")
@UseGuards(JwtAuthGuard)
export class CustomStatusController {
  constructor(
    private readonly createCustomStatusUseCase: CreateCustomStatusUseCase,
    private readonly updateCustomStatusUseCase: UpdateCustomStatusUseCase,
    private readonly getCustomStatusesUseCase: GetCustomStatusesUseCase,
    private readonly initializeDefaultStatusesUseCase: InitializeDefaultStatusesUseCase
  ) { }

  @Post()
  @ApiOperation({ summary: "Créer un statut personnalisé" })
  @ApiResponse({ status: 201, description: "Statut personnalisé créé" })
  async create(@Body() dto: CreateCustomStatusDto) {
    return await this.createCustomStatusUseCase.execute(dto);
  }

  @Get("project/:projectId")
  @ApiOperation({ summary: "Récupérer les statuts personnalisés d'un projet" })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiQuery({ name: "activeOnly", required: false, description: "Afficher seulement les statuts actifs" })
  @ApiResponse({ status: 200, description: "Liste des statuts personnalisés" })
  async getByProject(
    @Param("projectId") projectId: string,
    @Query("activeOnly") activeOnly?: string
  ) {
    const activeOnlyBool = activeOnly === "true";
    return await this.getCustomStatusesUseCase.execute(
      projectId,
      activeOnlyBool
    );
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateCustomStatusDto) {
    return await this.updateCustomStatusUseCase.execute(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return await this.updateCustomStatusUseCase.execute(id, {
      isActive: false,
    });
  }

  @Post("project/:projectId/initialize-defaults")
  @ApiOperation({ summary: "Initialiser les statuts par défaut pour un projet" })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiResponse({ status: 201, description: "Statuts par défaut initialisés" })
  async initializeDefaults(@Param("projectId") projectId: string) {
    return await this.initializeDefaultStatusesUseCase.execute(projectId);
  }

 
}