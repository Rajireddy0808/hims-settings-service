import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AboutService } from '../services/about.service';
import { AboutContent } from '../entities/about-content.entity';

@ApiTags('Public About')
@Controller('public-about')
export class PublicAboutController {
  constructor(private readonly aboutService: AboutService) {
    console.log('✅ PublicAboutController initialized');
  }

  @Get()
  @ApiOperation({ summary: 'Get active About content' })
  @ApiResponse({ status: 200, type: AboutContent })
  async getActive() {
    const content = await this.aboutService.getActive();
    if (!content) {
      console.warn('⚠️ No active About content found in database');
    }
    return content;
  }
}
