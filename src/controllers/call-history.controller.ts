import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CallHistoryService } from '../services/call-history.service';

@ApiTags('Call History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('call-history')
export class CallHistoryController {
  constructor(private readonly callHistoryService: CallHistoryService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all call history' })
  async getAllCallHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Request() req?: any
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const locId = locationId ? parseInt(locationId) : null;
    console.log('Call history params:', { page: pageNum, limit: limitNum, locationId: locId, fromDate, toDate });
    return this.callHistoryService.getAllCallHistory(pageNum, limitNum, locId, fromDate, toDate);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get call history for current user' })
  async getMyCallHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('userId') userId?: string,
    @Request() req?: any
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const locId = locationId ? parseInt(locationId) : null;
    const userIdNum = userId ? parseInt(userId) : req.user?.sub;
    
    // Set default dates to current month if not provided
    let defaultFromDate = fromDate;
    let defaultToDate = toDate;
    
    if (!fromDate || !toDate) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      defaultFromDate = firstDay.toISOString().split('T')[0];
      defaultToDate = lastDay.toISOString().split('T')[0];
    }
    
    return this.callHistoryService.getCallHistoryByUser(userIdNum, pageNum, limitNum, locId, defaultFromDate, defaultToDate);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get call history for specific user' })
  async getCallHistoryByUser(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const locId = locationId ? parseInt(locationId) : null;
    return this.callHistoryService.getCallHistoryByUser(parseInt(userId), pageNum, limitNum, locId, fromDate, toDate);
  }
}