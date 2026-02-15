import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AllergiesService } from '../services/allergies.service';

@ApiTags('Allergies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AllergiesController {
  constructor(private readonly allergiesService: AllergiesService) {}

  @Get('allergies')
  async getAllergies() {
    return this.allergiesService.getAllergies();
  }

  @Get('allergies-options/:id')
  async getAllergiesOptions(@Param('id') id: string) {
    return this.allergiesService.getAllergiesOptions(parseInt(id));
  }

  @Get('patient-allergies/:patientId')
  async getPatientAllergies(@Param('patientId') patientId: string, @Request() req: any) {
    return this.allergiesService.getPatientAllergies(patientId, req.user);
  }

  @Post('patient-allergies')
  async savePatientAllergies(@Body() data: any, @Request() req: any) {
    return this.allergiesService.savePatientAllergies(data, req.user);
  }

  @Delete('patient-allergies')
  async deletePatientAllergies(@Body() data: any, @Request() req: any) {
    return this.allergiesService.deletePatientAllergies(data, req.user);
  }
}
