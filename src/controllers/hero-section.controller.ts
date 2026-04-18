import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HeroSectionService } from '../services/hero-section.service';
import { HeroSection } from '../entities/hero-section.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

@ApiTags('Hero Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/hero-sections')
export class HeroSectionController {
  constructor(private readonly heroSectionService: HeroSectionService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/hero';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'hero-' + uniqueSuffix + extname(file.originalname));
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
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    const imageUrl = `/uploads/hero/${file.filename}`;
    return { imageUrl, message: 'Image uploaded successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create hero section slide' })
  @ApiResponse({ status: 201, type: HeroSection })
  create(@Body() createDto: any): Promise<HeroSection> {
    return this.heroSectionService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hero sections (Admin)' })
  @ApiResponse({ status: 200, type: [HeroSection] })
  findAll(): Promise<HeroSection[]> {
    return this.heroSectionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get hero section by ID' })
  @ApiResponse({ status: 200, type: HeroSection })
  findOne(@Param('id') id: string): Promise<HeroSection> {
    return this.heroSectionService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update hero section' })
  update(@Param('id') id: string, @Body() updateDto: any): Promise<HeroSection> {
    return this.heroSectionService.update(+id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hero section' })
  remove(@Param('id') id: string): Promise<void> {
    return this.heroSectionService.remove(+id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed initial hero slides' })
  seed(): Promise<void> {
    return this.heroSectionService.seedInitialData();
  }
}
