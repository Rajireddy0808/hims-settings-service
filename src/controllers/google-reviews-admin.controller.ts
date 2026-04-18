import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoogleReviewsService } from '../services/google-reviews.service';

@ApiTags('Admin Google Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings/google-reviews')
export class GoogleReviewsAdminController {
  constructor(private readonly svc: GoogleReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List Google reviews with pagination (admin)' })
  getAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) { 
    return this.svc.findAll(Number(page), Number(limit)); 
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review by ID' })
  getOne(@Param('id') id: string) { return this.svc.findOne(+id); }

  @Post()
  @ApiOperation({ summary: 'Create a new review entry' })
  create(@Body() body: any) { return this.svc.create(body); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review entry' })
  update(@Param('id') id: string, @Body() body: any) { return this.svc.update(+id, body); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review entry' })
  remove(@Param('id') id: string) { return this.svc.remove(+id); }
}
