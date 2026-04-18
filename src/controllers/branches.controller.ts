import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BranchesService } from '../services/branches.service';
import { Branch } from '../entities/branch.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/branches';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'branch-' + uniqueSuffix + extname(file.originalname));
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
    
    // Save also to the frontend path for local dev sync
    const frontendPath = 'C:/himsworkingcode/hims/frontend/public/uploads/branches';
    try {
      if (!fs.existsSync(frontendPath)) {
        fs.mkdirSync(frontendPath, { recursive: true });
      }
      fs.copyFileSync(file.path, join(frontendPath, file.filename));
    } catch (err) {
      console.warn('Could not copy to frontend path:', err.message);
    }

    const imageUrl = `/uploads/branches/${file.filename}`;
    return { imageUrl, message: 'Image uploaded successfully' };
  }

  @Post()
  @ApiOperation({ summary: 'Create clinic branch' })
  @ApiResponse({ status: 201, type: Branch })
  create(@Body() createBranchDto: any): Promise<Branch> {
    return this.branchesService.create(createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, type: [Branch] })
  findAll(): Promise<Branch[]> {
    return this.branchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiResponse({ status: 200, type: Branch })
  findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponse({ status: 200, type: Branch })
  update(@Param('id') id: string, @Body() updateBranchDto: any): Promise<Branch> {
    return this.branchesService.update(+id, updateBranchDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete branch' })
  @ApiResponse({ status: 204 })
  remove(@Param('id') id: string): Promise<void> {
    return this.branchesService.remove(+id);
  }
}
