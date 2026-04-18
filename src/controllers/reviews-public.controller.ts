import { Controller, Get } from '@nestjs/common';
import { ReviewsExternalService } from '../services/reviews-external.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Public Reviews')
@Controller('public/reviews')
export class ReviewsPublicController {
  constructor(private readonly reviewsService: ReviewsExternalService) {}

  @Get('external')
  @ApiOperation({ summary: 'Get reviews from external sources (Google)' })
  async getExternalReviews() {
    return this.reviewsService.getExternalReviews();
  }
}
