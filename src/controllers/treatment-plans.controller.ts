import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TreatmentPlansService } from '../services/treatment-plans.service';

@Controller('treatment-plans')
@UseGuards(JwtAuthGuard)
export class TreatmentPlansController {
  constructor(private readonly treatmentPlansService: TreatmentPlansService) {}

  @Get()
  async findAll() {
    return this.treatmentPlansService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.treatmentPlansService.findOne(+id);
  }

  @Post()
  async create(@Body() createTreatmentPlanDto: any) {
    return this.treatmentPlansService.create(createTreatmentPlanDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTreatmentPlanDto: any) {
    return this.treatmentPlansService.update(+id, updateTreatmentPlanDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.treatmentPlansService.remove(+id);
  }
}