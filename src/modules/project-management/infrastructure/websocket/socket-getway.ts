import {
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server } from 'socket.io';
  
  @WebSocketGateway({
    cors: { origin: '*' },
  })
  export class TrackingGateway {
    @WebSocketServer()
    server: Server;
  
    emit(event: string, data: any): void {
      this.server.emit(event, data);
    }
  }
  