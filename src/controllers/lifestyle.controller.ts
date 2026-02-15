import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LifestyleService } from '../services/lifestyle.service';

@ApiTags('Lifestyle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class LifestyleController {
  constructor(private readonly lifestyleService: LifestyleService) {}

  @Get('lifestyle')
  async getLifestyle() {
    return this.lifestyleService.getLifestyle();
  }

  @Get('lifestyle-options/:id')
  async getLifestyleOptions(@Param('id') id: string) {
    return this.lifestyleService.getLifestyleOptions(parseInt(id));
  }

  @Get('patient-lifestyle/:patientId')
  async getPatientLifestyle(@Param('patientId') patientId: string, @Request() req: any) {
    return this.lifestyleService.getPatientLifestyle(patientId, req.user);
  }

  @Post('patient-lifestyle')
  async savePatientLifestyle(@Body() data: any, @Request() req: any) {
    return this.lifestyleService.savePatientLifestyle(data, req.user);
  }

  @Delete('patient-lifestyle')
  async deletePatientLifestyle(@Body() data: any, @Request() req: any) {
    return this.lifestyleService.deletePatientLifestyle(data, req.user);
  }
}
