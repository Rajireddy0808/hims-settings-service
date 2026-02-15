import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HolidaysService } from '../services/holidays.service';
import { Holiday } from '../entities/holiday.entity';

@ApiTags('Settings - Holidays')
@Controller('settings/holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all holidays' })
  @ApiResponse({ status: 200, type: [Holiday] })
  async findAll(@Query('locationId') locationId?: string) {
    const locationIdNum = locationId ? parseInt(locationId) : undefined;
    return this.holidaysService.findAll(locationIdNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get holiday by ID' })
  @ApiResponse({ status: 200, type: Holiday })
  async findOne(@Param('id') id: string) {
    return this.holidaysService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new holiday' })
  @ApiResponse({ status: 201, type: Holiday })
  async create(@Body() createHolidayDto: Partial<Holiday>) {
    return this.holidaysService.create(createHolidayDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update holiday' })
  @ApiResponse({ status: 200, type: Holiday })
  async update(@Param('id') id: string, @Body() updateHolidayDto: Partial<Holiday>) {
    return this.holidaysService.update(+id, updateHolidayDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete holiday' })
  async remove(@Param('id') id: string) {
    return this.holidaysService.remove(+id);
  }
}
