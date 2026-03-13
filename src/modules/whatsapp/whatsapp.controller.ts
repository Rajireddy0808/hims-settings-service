import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    this.logger.log('Verifying WhatsApp webhook...');
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'HIMS_WHATSAPP_SECRET';
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      return challenge;
    }
    return 'Verification failed';
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    this.logger.log(`Received WhatsApp webhook: ${JSON.stringify(body)}`);

    // Standard WhatsApp Business API payload structure
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messages) {
            for (const message of change.value.messages) {
              const from = message.from;
              const text = message.text?.body || '';
              await this.whatsappService.handleIncomingMessage(from, text);
            }
          }
        }
      }
    }
    
    // Fallback for direct testing (simple payload)
    if (body.from && body.text) {
      await this.whatsappService.handleIncomingMessage(body.from, body.text);
    }

    return { success: true };
  }
}
