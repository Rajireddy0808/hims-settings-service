import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentTypeService } from '../services/appointment-type.service';
import { AppointmentType } from '../entities/appointment-type.entity';

@ApiTags('Appointment Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointment-types')
export class AppointmentTypeController {
  constructor(private readonly appointmentTypeService: AppointmentTypeService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appointment types' })
  async findAll(@Query('locationId') locationId?: string): Promise<AppointmentType[]> {
    const parsedLocationId = locationId ? parseInt(locationId) : undefined;
    return this.appointmentTypeService.findAll(parsedLocationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment type by ID' })
  async findOne(@Param('id') id: string): Promise<AppointmentType> {
    return this.appointmentTypeService.findOne(parseInt(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create new appointment type' })
  async create(@Body() appointmentTypeData: Partial<AppointmentType>): Promise<AppointmentType> {
    return this.appointmentTypeService.create(appointmentTypeData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment type' })
  async update(
    @Param('id') id: string,
    @Body() appointmentTypeData: Partial<AppointmentType>
  ): Promise<AppointmentType> {
    return this.appointmentTypeService.update(parseInt(id), appointmentTypeData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment type' })
  async delete(@Param('id') id: string): Promise<void> {
    return this.appointmentTypeService.delete(parseInt(id));
  }
}