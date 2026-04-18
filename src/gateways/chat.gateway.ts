import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @MessageBody() data: { guestId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.guestId);
    console.log(`Guest ${data.guestId} joined chat room`);
    
    // Send message history to the newly joined client
    const history = await this.chatService.getSessionHistory(data.guestId);
    client.emit('chat_history', history);
  }

  @SubscribeMessage('admin_join')
  handleAdminJoin(@ConnectedSocket() client: Socket) {
    client.join('admin_room');
    console.log('Admin joined admin_room');
  }

  @SubscribeMessage('visitor_send_message')
  async handleVisitorMessage(
    @MessageBody() data: { guestId: string; content: string; visitorName?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(data.guestId, 'visitor', data.content);
    
    // Emit to visitor (self)
    client.emit('new_message', message);
    
    // Emit to all admins
    this.server.to('admin_room').emit('visitor_message', {
      ...message,
      guestId: data.guestId,
      visitorName: data.visitorName || 'Guest Visitor',
    });
  }

  @SubscribeMessage('admin_send_message')
  async handleAdminMessage(
    @MessageBody() data: { guestId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.saveMessage(data.guestId, 'admin', data.content);
    
    // Emit back to admin
    client.emit('new_message', message);
    
    // Emit to specific visitor
    this.server.to(data.guestId).emit('admin_reply', message);
  }
}
