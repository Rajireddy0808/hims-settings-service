import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HeroSectionService } from '../services/hero-section.service';
import { HeroSection } from '../entities/hero-section.entity';

@ApiTags('Hero Sections (Public)')
@Controller('public/hero-sections')
export class HeroSectionPublicController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  @Get()
  @ApiOperation({ summary: 'Get active hero sections for landing page' })
  @ApiResponse({ status: 200, type: [HeroSection] })
  findActive(): Promise<HeroSection[]> {
    return this.heroSectionService.findActive();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed initial hero slides (Public)' })
  seed(): Promise<void> {
    return this.heroSectionService.seedInitialData();
  }

  @Get('verify-assets')
  @ApiOperation({ summary: 'Manually verify and copy hero assets from frontend (Public)' })
  async verifyAssets() {
    const fs = require('fs');
    const path = require('path');
    const frontendAssetsDir = 'c:/himsworkingcode/hims/frontend/app/src/assets';
    const backendUploadsDir = path.join(process.cwd(), 'uploads', 'hero');
    const report = [];

    try {
      if (!fs.existsSync(backendUploadsDir)) {
        fs.mkdirSync(backendUploadsDir, { recursive: true });
        report.push(`Created directory: ${backendUploadsDir}`);
      }

      const imagesToCopy = [
        { src: 'herosection1.png', dest: 'hero-1.png' },
        { src: 'herosection2.png', dest: 'hero-2.png' },
        { src: 'herosection3.png', dest: 'hero-3.png' },
      ];

      for (const img of imagesToCopy) {
        const srcPath = path.join(frontendAssetsDir, img.src);
        const destPath = path.join(backendUploadsDir, img.dest);
        
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          report.push(`Successfully copied ${img.src} to ${img.dest}`);
        } else {
          report.push(`FAILED: Source not found for ${img.src} at ${srcPath}`);
        }
      }
    } catch (err) {
      report.push(`ERROR: ${err.message}`);
    }

    return { report };
  }
}
