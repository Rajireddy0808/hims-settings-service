import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationsService } from '../services/locations.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsManagementController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getLocations() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  async getLocation(@Param('id') id: string) {

    return this.locationsService.findOne(+id);
  }

  @Get('test/ping')
  async testPing() {
    return { message: 'LocationsManagementController is working', timestamp: new Date() };
  }

  @Post()
  async createLocation(@Body() locationData: any) {
    return this.locationsService.create(locationData);
  }

  @Patch(':id')
  async updateLocation(@Param('id') id: string, @Body() locationData: any) {

    return this.locationsService.update(+id, locationData);
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    return this.locationsService.remove(+id);
  }
}
