import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RenewalService } from '../services/renewal.service';

@ApiTags('Renewal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('renewal')
export class RenewalController {
  constructor(private readonly renewalService: RenewalService) {}

  @Get('patients')
  @ApiOperation({ summary: 'Get patients with renewal dates' })
  async getRenewalPatients(
    @Request() req, 
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const userId = req.user?.user_id || req.user?.id;
    const locId = locationId ? parseInt(locationId) : req.user?.location_id || 1;
    return this.renewalService.getRenewalPatients(locId, fromDate, toDate, search, parseInt(page), parseInt(limit));
  }
}