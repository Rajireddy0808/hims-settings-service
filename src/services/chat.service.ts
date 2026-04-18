import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepository: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepository: Repository<ChatMessage>,
  ) {}

  async getOrCreateSession(guestId: string, visitorName?: string, visitorEmail?: string) {
    let session = await this.sessionRepository.findOne({
      where: { guestId },
      relations: ['messages'],
    });

    if (!session) {
      session = this.sessionRepository.create({
        guestId,
        visitorName,
        visitorEmail,
        status: 'active',
      });
      await this.sessionRepository.save(session);
    }

    return session;
  }

  async saveMessage(guestId: string, senderType: string, content: string) {
    const session = await this.getOrCreateSession(guestId);
    
    const message = this.messageRepository.create({
      sessionId: session.id,
      senderType,
      content,
    });

    return this.messageRepository.save(message);
  }

  async getSessionHistory(guestId: string) {
    const session = await this.sessionRepository.findOne({
      where: { guestId },
      relations: ['messages'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    return session ? session.messages : [];
  }

  async getAllActiveSessions() {
    return this.sessionRepository.find({
      where: { status: 'active' },
      relations: ['messages'],
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async updateSessionInfo(guestId: string, visitorName: string, visitorEmail: string) {
    const session = await this.getOrCreateSession(guestId);
    session.visitorName = visitorName;
    session.visitorEmail = visitorEmail;
    return this.sessionRepository.save(session);
  }
}
