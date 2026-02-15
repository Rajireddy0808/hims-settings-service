import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatientSourceService } from '../services/patient-source.service';

@ApiTags('Patient Source')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patient-source')
export class PatientSourceController {
  constructor(private readonly patientSourceService: PatientSourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patient sources' })
  async findAll() {
    return this.patientSourceService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create patient source' })
  async create(@Body() data: any) {
    return this.patientSourceService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient source' })
  async update(@Param('id') id: number, @Body() data: any) {
    return this.patientSourceService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient source' })
  async remove(@Param('id') id: number) {
    return this.patientSourceService.remove(id);
  }
}
