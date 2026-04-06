import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BlogsService } from '../services/blogs.service';
import { Blog } from '../entities/blog.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('Blogs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/blogs';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + extname(file.originalname));
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
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Save also to the frontend path if it exists as per user request
    const frontendPath = 'C:/himsworkingcode/hims/frontend/public/uploads/blogs';
    try {
      if (!fs.existsSync(frontendPath)) {
        fs.mkdirSync(frontendPath, { recursive: true });
      }
      fs.copyFileSync(file.path, join(frontendPath, file.filename));
    } catch (err) {
      console.warn('Could not copy to frontend path:', err.message);
    }

    const imageUrl = `/uploads/blogs/${file.filename}`;
    return { imageUrl, message: 'Image uploaded successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create blog' })
  @ApiResponse({ status: 201, type: Blog })
  create(@Body() createBlogDto: any): Promise<Blog> {
    return this.blogsService.create(createBlogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blogs' })
  @ApiResponse({ status: 200, type: [Blog] })
  findAll(): Promise<Blog[]> {
    return this.blogsService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed initial blogs data' })
  seed(): Promise<void> {
    return this.blogsService.seed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blog by ID' })
  @ApiResponse({ status: 200, type: Blog })
  findOne(@Param('id') id: string): Promise<Blog> {
    return this.blogsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update blog' })
  @ApiResponse({ status: 200, type: Blog })
  update(@Param('id') id: string, @Body() updateBlogDto: any): Promise<Blog> {
    return this.blogsService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete blog' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.blogsService.remove(+id);
  }
}
