import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TreatmentsService } from '../services/treatments.service';
import { Treatment } from '../entities/treatment.entity';

@ApiTags('Public Treatments')
@Controller('public-treatments')
export class PublicTreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get('fix-db')
  @ApiOperation({ summary: 'Internal: Fix database schema for treatments' })
  fixDb(): Promise<string> {
    return this.treatmentsService.fixDb();
  }

  @Get()
  @ApiOperation({ summary: 'Get all active treatments for public display' })
  @ApiResponse({ status: 200, type: [Treatment] })
  findAllActive(): Promise<Treatment[]> {
    return this.treatmentsService.findAllActive();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a treatment by slug for public display' })
  @ApiResponse({ status: 200, type: Treatment })
  findBySlug(@Param('slug') slug: string): Promise<Treatment> {
    return this.treatmentsService.findOneBySlug(slug);
  }
}
