import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { TaskStatusSyncService } from "../../application/services/task-status-sync.service";
import { JwtAuthGuard } from "@modules/auth/infrastructure/guards/jwt-auth.guard";

@Controller("task-status-sync")
@UseGuards(JwtAuthGuard)
export class TaskStatusSyncController {
  constructor(private readonly taskStatusSyncService: TaskStatusSyncService) {}

  @Get("task/:taskId")
  async getTaskWithCustomStatus(@Param("taskId") taskId: string) {
    return await this.taskStatusSyncService.getTaskWithCustomStatus(taskId);
  }

  @Post("sync")
  async syncTaskStatus(
    @Body() body: { taskId: string; oldStatus: string; newStatus: string }
  ) {
    await this.taskStatusSyncService.syncTaskStatusChange(
      body.taskId,
      body.oldStatus as any,
      body.newStatus as any
    );
    return { message: "Task status synced successfully" };
  }
}
