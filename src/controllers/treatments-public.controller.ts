import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TreatmentsService } from '../services/treatments.service';
import { Treatment } from '../entities/treatment.entity';

@ApiTags('Public Treatments')
@Controller('public-treatments')
export class PublicTreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active treatments for public display' })
  @ApiResponse({ status: 200, type: [Treatment] })
  findAllActive(): Promise<Treatment[]> {
    return this.treatmentsService.findAllActive();
  }
}
