import { Controller, Get, Post, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TelecallerService } from '../services/telecaller.service';

@ApiTags('Telecaller')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TelecallerController {
  constructor(private readonly telecallerService: TelecallerService) {}

  @Get('patients/:id/call-history')
  @ApiOperation({ summary: 'Get patient call history' })
  async getPatientCallHistory(@Param('id') patientId: string, @Request() req, @Query('locationId') locationId?: string) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    const locId = locationId ? parseInt(locationId) : undefined;
    return this.telecallerService.getCallHistory(patientId, locId, userId);
  }

  @Post('patients/:id/call-history')
  @ApiOperation({ summary: 'Add call record' })
  async addCallRecord(@Param('id') patientId: string, @Body() callData: any, @Request() req, @Query('locationId') locationId?: string) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    const locId = locationId ? parseInt(locationId) : (callData.locationId ? parseInt(callData.locationId) : undefined);
    return this.telecallerService.addCallRecord(patientId, callData, userId, locId);
  }
}
