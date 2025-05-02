import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  

  @WebSocketGateway({ cors: true }) 
  export class ProjectGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private logger: Logger = new Logger('ProjectGateway');
  
    afterInit(server: Server) {
      this.logger.log('WebSocket Gateway Initialized');
    }
  
    handleConnection(client: Socket) {
      this.logger.log(`Client connected: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    // rejoindre une room de projet
    @SubscribeMessage('joinProject')
    handleJoinProject(client: Socket, projectId: string): void {
      client.join(`project_${projectId}`);
      this.logger.log(`Client ${client.id} joined room project_${projectId}`);
    }
  
    // Événement 
    emitProjectUpdate(projectId: string, data: any) {
      this.server.to(`project_${projectId}`).emit('projectUpdated', data);
      this.logger.log(`projectUpdated sent to project_${projectId}`);
    }
  }
  