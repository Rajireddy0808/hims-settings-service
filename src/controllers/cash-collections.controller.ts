import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CashCollectionsService } from '../services/cash-collections.service';

@Controller('cash-collections')
@UseGuards(JwtAuthGuard)
export class CashCollectionsController {
  constructor(private readonly cashCollectionsService: CashCollectionsService) {}

  @Get()
  getCashCollections(
    @Query('locationId') locationId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const location = locationId ? parseInt(locationId) : undefined;
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.cashCollectionsService.getCashCollections(location, pageNum, limitNum, fromDate, toDate);
  }
}