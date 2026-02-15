import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationsService } from '../services/locations.service';
import { Location } from '../entities/location.entity';

@ApiTags('Locations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('locations')
export class LocationsPublicController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('user-branches')
  @ApiOperation({ summary: 'Get user accessible branches' })
  @ApiResponse({ status: 200, type: [Location] })
  getUserBranches(@Request() req): Promise<Location[]> {
    const userLocationId = req.user?.location_id;
    return this.locationsService.getUserAccessibleLocations(userLocationId);
  }
}
