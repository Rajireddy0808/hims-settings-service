import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DietChartService } from '../services/diet-chart.service';

@ApiTags('Diet Chart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DietChartController {
  constructor(private readonly dietChartService: DietChartService) {}

  @Get('patient-diet-charts/:patientId')
  async getPatientDietCharts(@Param('patientId') patientId: string, @Request() req: any) {
    return this.dietChartService.getPatientDietCharts(patientId, req.user);
  }

  @Post('patient-diet-charts')
  async savePatientDietCharts(@Body() data: any, @Request() req: any) {
    return this.dietChartService.savePatientDietCharts(data, req.user);
  }

  @Delete('patient-diet-charts/:id')
  async deletePatientDietChart(@Param('id') id: string, @Request() req: any) {
    return this.dietChartService.deletePatientDietChart(parseInt(id), req.user);
  }
}
