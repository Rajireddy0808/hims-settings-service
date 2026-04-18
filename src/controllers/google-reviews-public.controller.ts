import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GoogleReviewsService } from '../services/google-reviews.service';

@ApiTags('Public Google Reviews')
@Controller('public/google-reviews')
export class GoogleReviewsPublicController {
  constructor(private readonly svc: GoogleReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active Google reviews grouped by branch for the website' })
  getActiveReviews() {
    return this.svc.getActiveReviewsByBranch();
  }
}
