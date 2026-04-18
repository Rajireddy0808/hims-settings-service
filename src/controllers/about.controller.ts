import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AboutService } from '../services/about.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Post('upload-images')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/about';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'about-' + uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  }))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    
    // Sync to frontend public path
    const frontendPath = 'C:/himsworkingcode/hims/frontend/public/uploads/about';
    const urls = [];

    try {
      if (!fs.existsSync(frontendPath)) {
        fs.mkdirSync(frontendPath, { recursive: true });
      }
      
      for (const file of files) {
        fs.copyFileSync(file.path, join(frontendPath, file.filename));
        urls.push(`/uploads/about/${file.filename}`);
      }
    } catch (err) {
      console.warn('Could not copy to frontend path:', err.message);
      // Still return the backend URLs
      for (const file of files) {
        if (!urls.includes(`/uploads/about/${file.filename}`)) {
          urls.push(`/uploads/about/${file.filename}`);
        }
      }
    }

    return { urls, message: `${files.length} images uploaded successfully` };
  }

  @Post()
  create(@Body() createAboutDto: any) {
    return this.aboutService.create(createAboutDto);
  }

  @Get()
  findAll() {
    return this.aboutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aboutService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAboutDto: any) {
    return this.aboutService.update(+id, updateAboutDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aboutService.remove(+id);
  }
}
