import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger, UseGuards } from '@nestjs/common';
  import { CreateChatMessageDto } from '../../application/dto/create-chat-message.dto';
  import { CreateChatMessageUseCase } from '../../application/use-cases/create-chat-message.use-case';
  import { GetProjectMessagesUseCase } from '../../application/use-cases/get-project-messages.use-case';
  import { JwtAuthGuard } from '@modules/auth/infrastructure/strategies/jwt-auth.guard';
  import { CurrentUser } from '@modules/auth/application/decorators/current-user.decorator';
  import { User } from '@modules/auth/domain/entities/user.entity';
  
  @WebSocketGateway({
    namespace: 'project-chat',
    cors: {
      origin: '*',
    },
  })
  @UseGuards(JwtAuthGuard)
  export class ProjectChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(ProjectChatGateway.name);
  
    @WebSocketServer()
    server: Server;
  
    constructor(
      private readonly createChatMessage: CreateChatMessageUseCase,
      private readonly getProjectMessages: GetProjectMessagesUseCase,
    ) {}
  
    async handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    async handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    @SubscribeMessage('join_project')
    async handleJoinProject(
      @MessageBody('projectId') projectId: string,
      @ConnectedSocket() client: Socket,
      @CurrentUser() user: User,
    ) {
      client.join(projectId);
      this.logger.debug(`User ${user.id} joined room ${projectId}`);
      return { event: 'joined', projectId };
    }
  
    @SubscribeMessage('send_message')
    async handleSendMessage(
      @MessageBody() data: CreateChatMessageDto,
      @ConnectedSocket() client: Socket,
      @CurrentUser() user: User,
    ) {
      try {
        const saved = await this.createChatMessage.execute(data, user.id);
  
        // broadcast dans la room
        this.server.to(data.projectId).emit('message_received', {
          id: saved.id,
          projectId: saved.projectId,
          senderId: saved.senderId,
          content: saved.content,
          createdAt: saved.createdAt,
        });
  
        return { status: 'ok', messageId: saved.id };
      } catch (err: any) {
        this.logger.error(`Error sending message: ${err.message}`);
        client.emit('error', { message: err.message });
      }
    }
  
    @SubscribeMessage('get_messages')
    async handleGetMessages(
      @MessageBody() data: { projectId: string; limit?: number; page?: number },
      @CurrentUser() user: User,
    ) {
      const messages = await this.getProjectMessages.execute(
        data.projectId,
        user.id,
        data.limit ?? 20,
        data.page ?? 1,
      );
      return { event: 'messages', data: messages };
    }
  }
  