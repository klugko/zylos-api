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
import { CreateCustomStatusUseCase } from "../../application/use-cases/create-custom-status.use-case";
import { UpdateCustomStatusUseCase } from "../../application/use-cases/update-custom-status.use-case";
import { GetCustomStatusesUseCase } from "../../application/use-cases/get-custom-statuses.use-case";
import { CreateCustomStatusDto } from "../../application/dto/create-custom-status.dto";
import { UpdateCustomStatusDto } from "../../application/dto/update-custom-status.dto";
import { JwtAuthGuard } from "@modules/auth/infrastructure/guards/jwt-auth.guard";

@Controller("custom-statuses")
@UseGuards(JwtAuthGuard)
export class CustomStatusController {
  constructor(
    private readonly createCustomStatusUseCase: CreateCustomStatusUseCase,
    private readonly updateCustomStatusUseCase: UpdateCustomStatusUseCase,
    private readonly getCustomStatusesUseCase: GetCustomStatusesUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateCustomStatusDto) {
    return await this.createCustomStatusUseCase.execute(dto);
  }

  @Get("project/:projectId")
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
}
