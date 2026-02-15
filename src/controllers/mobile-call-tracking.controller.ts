import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MobileCallTrackingService } from '../services/mobile-call-tracking.service';

@ApiTags('Mobile Call Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mobile-call-tracking')
export class MobileCallTrackingController {
  constructor(private readonly mobileCallTrackingService: MobileCallTrackingService) {}

  @Get('my-numbers')
  @ApiOperation({ summary: 'Get assigned mobile numbers for current user' })
  async getMyNumbers(@Request() req) {
    const userId = req.user?.user_id || req.user?.id || req.user?.sub;
    console.log('Getting numbers for user:', userId);
    return this.mobileCallTrackingService.getAssignedNumbers(userId);
  }

  @Get('test')
  async test() {
    return { message: 'API working', timestamp: new Date() };
  }

  @Post('update-call/:id')
  @ApiOperation({ summary: 'Update call details for mobile number' })
  async updateCall(@Param('id') id: string, @Body() callData: any, @Request() req) {
    const userId = req.user?.user_id || req.user?.id || 1;
    return this.mobileCallTrackingService.updateCallDetails(parseInt(id), callData, userId);
  }
}