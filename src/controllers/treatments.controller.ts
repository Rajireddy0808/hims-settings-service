import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TreatmentsService } from '../services/treatments.service';
import { Treatment } from '../entities/treatment.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Treatments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/treatments')
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const fs = require('fs');
        const uploadPath = './uploads/treatments';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'treatment-' + uniqueSuffix + extname(file.originalname));
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
    const imageUrl = `/uploads/treatments/${file.filename}`;
    return { imageUrl, message: 'Image uploaded successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create treatment' })
  @ApiResponse({ status: 201, type: Treatment })
  create(@Body() createTreatmentDto: any): Promise<Treatment> {
    return this.treatmentsService.create(createTreatmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all treatments' })
  @ApiResponse({ status: 200, type: [Treatment] })
  findAll(): Promise<Treatment[]> {
    return this.treatmentsService.findAll();
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed initial treatments data' })
  seed(): Promise<void> {
    return this.treatmentsService.seed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get treatment by ID' })
  @ApiResponse({ status: 200, type: Treatment })
  findOne(@Param('id') id: string): Promise<Treatment> {
    return this.treatmentsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update treatment' })
  @ApiResponse({ status: 200, type: [Treatment] })
  update(@Param('id') id: string, @Body() updateTreatmentDto: any): Promise<Treatment> {
    return this.treatmentsService.update(+id, updateTreatmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete treatment' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.treatmentsService.remove(+id);
  }
}
