import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  Get,
  Inject,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateProjectDto } from "../../application/dto/create-project.dto";
import { UpdateProjectDto } from "../../application/dto/update-project.dto";
import { CreateProjectUseCase } from "../../application/use-cases/create-project.use-case";
import { Project } from "../../domain/entities/project.entity";
import { UpdateProjectUseCase } from "../../application/use-cases/update-project.use-case";
import { DeleteProjectUseCase } from "../../application/use-cases/delete-project.use-case";
import { GetAllProjectsUseCase } from "../../application/use-cases/get-all-projects.use-case";
import { CurrentUser } from "src/modules/auth/application/decorators/current-user.decorator";
import { User } from "src/modules/auth/domain/entities/user.entity";
import { ProjectWithDetails } from "@modules/project-management/domain/entities/project-with-details.entity";
import { GetAllProjectsWithDetailsUseCase } from "@modules/project-management/application/use-cases/get-all-projects-with-details.use-case";
import { ProjectRepository } from "@modules/project-management/domain/interfaces/project-repository.interface";
import { GetProjectProgressUseCase } from "@modules/project-management/application/use-cases/get-project-progress.use-case";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";
import { FindProjectsByUserDto } from "@modules/project-management/application/dto/find-projects-by-user.dto";
import { FindProjectsByUserUseCase } from "@modules/project-management/application/use-cases/find-projects-by-user.use-case";
import { GetProjectMembersUseCase } from "@modules/project-management/application/use-cases/get-project-member.usecase";
import { AddProjectMembersUseCase } from "@modules/project-management/application/use-cases/add-project-members.use-case";
import { AddProjectMembersDto } from "@modules/project-management/application/dto/add-project-members.dto";

@ApiTags("Projects")
@Controller("api/v1/projects")
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
    private readonly getAllProjectsWithDetailsUseCase: GetAllProjectsWithDetailsUseCase,
    private readonly getProjectProgressUseCase: GetProjectProgressUseCase,
    private readonly findProjectsByUserUseCase: FindProjectsByUserUseCase,
    private readonly getMembersUseCase: GetProjectMembersUseCase,
    private readonly addMembersUseCase: AddProjectMembersUseCase,
    @Inject("ProjectRepository")
    private readonly projectRepository: ProjectRepository
  ) {}

  @Get("details")
  @ApiOperation({ summary: "Get all projects with their tasks and checklists" })
  @ApiResponse({
    status: 200,
    description: "All projects including their tasks and checklists",
    type: [ProjectWithDetails],
  })
  async getAllProjectsWithDetails(): Promise<{ data: ProjectWithDetails[] }> {
    const projects = await this.getAllProjectsWithDetailsUseCase.execute();
    return { data: projects };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Récupérer un projet par son ID" })
  @ApiParam({ name: "id", type: "string", description: "ID du projet" })
  @ApiResponse({ status: 200, description: "Projet trouvé", type: Project })
  @ApiResponse({ status: 404, description: "Projet non trouvé" })
  async getById(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<Project> {
    try {
      const project = await this.projectRepository.findById(id);
      if (!project) {
        throw new HttpException(
          `Projet avec l'ID ${id} introuvable.`,
          HttpStatus.NOT_FOUND
        );
      }
      if (project.ownerId !== user.id) {
        throw new ForbiddenException("Vous n'avez pas accès à ce projet.");
      }
      return project;
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      throw new HttpException(
        error?.message || "Erreur inattendue.",
        error?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("members/add")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Ajouter des membres à un projet",
    description: `Permet d'ajouter un ou plusieurs utilisateurs à un projet existant, avec leur rôle (MEMBER, OWNER, OBSERVER).`,
  })
  @ApiResponse({
    status: 201,
    description: "Membres ajoutés avec succès.",
  })
  @ApiResponse({
    status: 404,
    description: "Projet non trouvé.",
  })
  async addMembers(@Body() dto: AddProjectMembersDto) {
    await this.addMembersUseCase.execute(dto);
    return { message: "Membres ajoutés avec succès." };
  }

  @Get(":projectId/members")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({
    summary: "Lister les membres d’un projet (via ProjectMember)",
  })
  @ApiResponse({ status: 200, description: "Liste des membres du projet" })
  @ApiResponse({
    status: 204,
    description: "Aucun membre trouvé pour ce projet",
  })
  async getMembers(@Param("projectId") projectId: string) {
    const members = await this.getMembersUseCase.execute(projectId);
    if (!members) {
      return {
        statusCode: 204,
        message: "Aucun membre trouvé pour ce projet.",
      };
    }
    return members;
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Récupérer tous les projets" })
  @ApiResponse({ status: 200, description: "Liste de tous les projets" })
  @ApiResponse({ status: 401, description: "Non autorisé." })
  async getAll(@CurrentUser() user: User): Promise<Project[]> {
    return this.getAllProjectsUseCase.execute(user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiResponse({
    status: 201,
    description: "Projet créé avec ses tasks et checklists",
  })
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() user: User
  ): Promise<any> {
    const projectWithRelations = await this.createProjectUseCase.execute(
      dto,
      user.id
    );
    return {
      project: {
        id: projectWithRelations.id,
        name: projectWithRelations.name,
        description: projectWithRelations.description,
        status: projectWithRelations.status,
        priority: projectWithRelations.priority,
      },
      tasks: projectWithRelations.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        checklists: t.checklists.map((c) => ({
          id: c.id,
          title: c.title,
          isCompleted: c.isCompleted,
        })),
      })),
    };
  }

  @Get(":id/progress")
  @ApiOperation({ summary: "Récupérer l’avancement du projet (en %)" })
  async getProgress(@Param("id") id: string) {
    return this.getProjectProgressUseCase.execute(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Mettre à jour un projet existant" })
  @ApiResponse({ status: 200, description: "Projet mis à jour avec succès." })
  @ApiResponse({ status: 404, description: "Projet non trouvé." })
  @ApiResponse({ status: 401, description: "Non autorisé." })
  @ApiResponse({
    status: 403,
    description:
      "Accès refusé. L'utilisateur n'est pas autorisé à modifier ce projet.",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() user: User
  ): Promise<Project> {
    try {
      return await this.updateProjectUseCase.execute(id, dto, user.id);
    } catch (error) {
      throw new HttpException(
        error?.message ?? "Erreur inattendue lors de la mise à jour du projet.",
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Supprimer un projet" })
  @ApiParam({ name: "id", description: "ID du projet à supprimer" })
  @ApiResponse({ status: 200, description: "Projet supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Projet non trouvé" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  async delete(
    @Param("id") id: string,
    @CurrentUser() user: User
  ): Promise<{ message: string }> {
    try {
      await this.deleteProjectUseCase.execute(id, user.id);
      return { message: "Projet supprimé avec succès" };
    } catch (error) {
      throw new HttpException(
        error?.message ?? "Erreur inattendue lors de la suppression du projet.",
        error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
