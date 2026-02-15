import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConsultationService } from '../services/consultation.service';

@ApiTags('Consultation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @ApiOperation({ summary: 'Record consultation fee' })
  async recordConsultation(@Request() req, @Body() consultationData: any) {
    const locationId = req.user.locationId || req.user.primary_location_id || 1;
    return this.consultationService.recordConsultation(consultationData, locationId);
  }
}
