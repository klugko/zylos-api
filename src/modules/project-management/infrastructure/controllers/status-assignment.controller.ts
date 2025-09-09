import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { AssignCustomStatusUseCase } from "../../application/use-cases/assign-custom-status.use-case";
import { AssignCustomStatusDto } from "../../application/dto/assign-custom-status.dto";
import { JwtAuthGuard } from "@modules/auth/infrastructure/strategies/jwt-auth.guard";

@Controller("api/v1/status-assignments")
@UseGuards(JwtAuthGuard)
export class StatusAssignmentController {
  constructor(
    private readonly assignCustomStatusUseCase: AssignCustomStatusUseCase
  ) {}

  @Post()
  async assignStatus(@Body() dto: AssignCustomStatusDto) {
    return await this.assignCustomStatusUseCase.execute(dto);
  }
}
