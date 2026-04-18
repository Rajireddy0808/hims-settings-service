import { Controller, Get } from '@nestjs/common';
import { ModulesService } from '../services/modules.service';

@Controller('test')
export class TestController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  test() {
    return { message: 'Settings service is running', timestamp: new Date().toISOString() };
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'settings-service' };
  }

  @Get('seed-chat')
  async seedChat() {
    try {
      // 0. Ensure tables exist (since synchronize: false)
      const createSessionsTable = `
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id SERIAL PRIMARY KEY,
          "guestId" VARCHAR UNIQUE NOT NULL,
          "visitorName" VARCHAR,
          "visitorEmail" VARCHAR,
          status VARCHAR DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      const createMessagesTable = `
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
          "senderType" VARCHAR NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      // Access the repository to run queries (we can use ModulesService's repo access)
      await (this.modulesService as any).moduleRepository.query(createSessionsTable);
      await (this.modulesService as any).moduleRepository.query(createMessagesTable);

      // 1. Create Module
      const chatModule = await this.modulesService.createModule({
        name: 'Live Chat',
        path: '/admin/website/chat',
        icon: 'message-square',
        order: 10,
        status: 1,
        isActive: true
      });

      // 2. Create SubModule
      await this.modulesService.createSubModule({
        moduleId: chatModule.id,
        subcatName: 'Chat Console',
        subcatPath: '/admin/website/chat',
        icon: 'messagesquare',
        isActive: true
      });

      return { success: true, message: 'Tables created and Chat module seeded successfully', moduleId: chatModule.id };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
