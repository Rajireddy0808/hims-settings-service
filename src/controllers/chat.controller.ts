import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Get chat history by guest ID' })
  @Get('history/:guestId')
  async getHistory(@Param('guestId') guestId: string) {
    return this.chatService.getSessionHistory(guestId);
  }

  @ApiOperation({ summary: 'Get all active chat sessions (Admin only)' })
  @Get('sessions')
  async getActiveSessions() {
    return this.chatService.getAllActiveSessions();
  }

  @ApiOperation({ summary: 'Mark session as read' })
  @Patch('sessions/:id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.chatService.markAsRead(id);
  }

  @ApiOperation({ summary: 'Update visitor information' })
  @Post('visitor-info')
  async updateInfo(@Body() data: { guestId: string; name: string; email: string }) {
    return this.chatService.updateSessionInfo(data.guestId, data.name, data.email);
  }
}
