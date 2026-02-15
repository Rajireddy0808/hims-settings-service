import { Controller, Get, Put, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemSettingsService } from '../services/system-settings.service';
import { UpdateSystemSettingsDto } from '../dto/system-settings.dto';
import { diskStorage } from 'multer';
import type { File } from 'multer';
import { extname } from 'path';

@Controller('system-settings')
@UseGuards(JwtAuthGuard)
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get()
  async getSettings() {
    return await this.systemSettingsService.getAllSettings();
  }

  @Put()
  async updateSettings(@Body() updateDto: UpdateSystemSettingsDto) {
    return await this.systemSettingsService.updateSettings(updateDto);
  }

  @Get('initialize')
  async initializeSettings() {
    await this.systemSettingsService.initializeDefaultSettings();
    return { message: 'Default settings initialized successfully' };
  }

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const fs = require('fs');
        const uploadPath = './uploads/logos';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }))
  async uploadLogo(@UploadedFile() file: File) {
    try {

      if (!file) {
        throw new Error('No file uploaded');
      }
      // Return URL path that can be served by static file server
      const logoUrl = `/uploads/logos/${file.filename}`;

      return { logoUrl, message: 'Logo uploaded successfully' };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }


}
