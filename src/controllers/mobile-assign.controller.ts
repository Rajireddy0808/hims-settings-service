import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MobileAssignService } from '../services/mobile-assign.service';

@ApiTags('Mobile Assign')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mobile-assign')
export class MobileAssignController {
  constructor(private readonly mobileAssignService: MobileAssignService) {}

  @Get('unassigned')
  @ApiOperation({ summary: 'Get unassigned mobile numbers' })
  async getUnassignedNumbers(@Request() req) {
    const page = parseInt(req.query?.page) || 1;
    const limit = parseInt(req.query?.limit) || 10;
    return this.mobileAssignService.getUnassignedNumbers(page, limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get users for assignment' })
  async getUsers(@Request() req) {
    const locationId = req.user?.location_id || 1;
    return this.mobileAssignService.getUsers(locationId);
  }

  @Post('assign')
  @ApiOperation({ summary: 'Assign mobile numbers to user' })
  async assignNumbers(@Body() data: { mobileIds: number[], userId: number }, @Request() req) {
    const assignedBy = req.user?.user_id || req.user?.id;
    return this.mobileAssignService.assignNumbers(data.mobileIds, data.userId, assignedBy);
  }
}