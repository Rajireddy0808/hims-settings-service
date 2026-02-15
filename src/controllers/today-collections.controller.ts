import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TodayCollectionsService } from '../services/today-collections.service';

@Controller('today-collections')
@UseGuards(JwtAuthGuard)
export class TodayCollectionsController {
  constructor(private readonly todayCollectionsService: TodayCollectionsService) {}

  @Get()
  getTodayCollections(
    @Query('locationId') locationId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const location = locationId ? parseInt(locationId) : undefined;
    return this.todayCollectionsService.getTodayCollections(location, fromDate, toDate);
  }
}