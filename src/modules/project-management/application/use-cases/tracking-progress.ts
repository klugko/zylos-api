import { TrackingGateway } from '@modules/project-management/infrastructure/websocket/socket-getway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackingService {
  constructor(private readonly gateway: TrackingGateway) {}

  emit(event: string, data: any): void {
    this.gateway.emit(event, data);
  }

  emitTaskUpdated(taskId: string, payload: any): void {
    this.emit('task.updated', { taskId, ...payload });
  }

  emitProjectProgress(projectId: string, progress: number): void {
    this.emit('project.progress.updated', { projectId, progress });
  }
}
