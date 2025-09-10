import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";
import { CreateTaskColumnDto } from "../../application/dto/create-task-column.dto";
import { UpdateTaskColumnDto } from "../../application/dto/update-task-column.dto";
import { CreateTaskColumnUseCase } from "../../application/use-cases/create-task-column.use-case";
import { UpdateTaskColumnUseCase } from "../../application/use-cases/update-task-column.use-case";
import { DeleteTaskColumnUseCase } from "../../application/use-cases/delete-task-column.use-case";
import { GetTaskColumnsUseCase } from "../../application/use-cases/get-task-columns.use-case";
import { ReorderTaskColumnsUseCase } from "../../application/use-cases/reorder-task-columns.use-case";
import { InitializeDefaultColumnsUseCase } from "../../application/use-cases/initialize-default-columns.use-case";

@ApiTags("Task Columns")
@Controller("api/v1/task-columns")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class TaskColumnController {
  constructor(
    private readonly createTaskColumnUseCase: CreateTaskColumnUseCase,
    private readonly updateTaskColumnUseCase: UpdateTaskColumnUseCase,
    private readonly deleteTaskColumnUseCase: DeleteTaskColumnUseCase,
    private readonly getTaskColumnsUseCase: GetTaskColumnsUseCase,
    private readonly reorderTaskColumnsUseCase: ReorderTaskColumnsUseCase,
    private readonly initializeDefaultColumnsUseCase: InitializeDefaultColumnsUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: "Créer une nouvelle colonne de tâches" })
  @ApiBody({ type: CreateTaskColumnDto })
  @ApiResponse({ status: 201, description: "Colonne créée avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  async create(@Body() dto: CreateTaskColumnDto) {
    try {
      return await this.createTaskColumnUseCase.execute(dto);
    } catch (error) {
      throw new HttpException(
        error.message || "Erreur lors de la création de la colonne",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get("project/:projectId")
  @ApiOperation({ summary: "Récupérer toutes les colonnes d'un projet" })
  @ApiParam({ name: "projectId", description: "ID du projet" })
  @ApiResponse({ status: 200, description: "Liste des colonnes retournée" })
  async findByProject(@Param("projectId") projectId: string) {
    return await this.getTaskColumnsUseCase.execute(projectId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Mettre à jour une colonne de tâches" })
  @ApiParam({ name: "id", description: "ID de la colonne" })
  @ApiBody({ type: UpdateTaskColumnDto })
  @ApiResponse({ status: 200, description: "Colonne mise à jour avec succès" })
  @ApiResponse({ status: 404, description: "Colonne non trouvée" })
  async update(@Param("id") id: string, @Body() dto: UpdateTaskColumnDto) {
    try {
      return await this.updateTaskColumnUseCase.execute(id, dto);
    } catch (error) {
      if (error.message.includes("non trouvée")) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        error.message || "Erreur lors de la mise à jour de la colonne",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(":id")
  @ApiOperation({ summary: "Supprimer une colonne de tâches" })
  @ApiParam({ name: "id", description: "ID de la colonne" })
  @ApiResponse({ status: 200, description: "Colonne supprimée avec succès" })
  @ApiResponse({
    status: 400,
    description: "Impossible de supprimer une colonne contenant des tâches",
  })
  @ApiResponse({ status: 404, description: "Colonne non trouvée" })
  async delete(@Param("id") id: string) {
    try {
      await this.deleteTaskColumnUseCase.execute(id);
      return { message: "Colonne supprimée avec succès" };
    } catch (error) {
      if (error.message.includes("non trouvée")) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error.message.includes("contient des tâches")) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.message || "Erreur lors de la suppression de la colonne",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Put("reorder")
  @ApiOperation({ summary: "Réorganiser l'ordre des colonnes" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        columnOrders: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              order: { type: "number" },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Ordre des colonnes mis à jour" })
  async reorder(
    @Body()
    body: {
      projectId: string;
      columnOrders: { id: string; order: number }[];
    }
  ) {
    try {
      return await this.reorderTaskColumnsUseCase.execute(
        body.projectId,
        body.columnOrders
      );
    } catch (error) {
      throw new HttpException(
        error.message || "Erreur lors de la réorganisation des colonnes",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("initialize-defaults")
  @ApiOperation({
    summary: "Initialiser les colonnes par défaut pour un projet",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        projectId: { type: "string", description: "ID du projet" },
      },
      required: ["projectId"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Colonnes par défaut créées avec succès",
  })
  async initializeDefaults(@Body() body: { projectId: string }) {
    try {
      return await this.initializeDefaultColumnsUseCase.execute(body.projectId);
    } catch (error) {
      throw new HttpException(
        error.message ||
          "Erreur lors de l'initialisation des colonnes par défaut",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
