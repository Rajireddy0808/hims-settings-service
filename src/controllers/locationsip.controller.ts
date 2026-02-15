import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { LocationsIpService } from '../services/locationsip.service';

@Controller('locationsip')
export class LocationsIpController {
  constructor(private readonly locationsIpService: LocationsIpService) {}

  @Get()
  findAll() {
    return this.locationsIpService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.locationsIpService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.locationsIpService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationsIpService.remove(+id);
  }
}
