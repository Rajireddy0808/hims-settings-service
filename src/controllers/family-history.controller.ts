import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FamilyHistoryService } from '../services/family-history.service';

@ApiTags('Family History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class FamilyHistoryController {
  constructor(private readonly familyHistoryService: FamilyHistoryService) {}

  @Get('family-history')
  async getFamilyHistory() {
    return this.familyHistoryService.getFamilyHistory();
  }

  @Get('family-history-options/:id')
  async getFamilyHistoryOptions(@Param('id') id: string) {
    return this.familyHistoryService.getFamilyHistoryOptions(parseInt(id));
  }

  @Get('patient-family-history/:patientId')
  async getPatientFamilyHistory(@Param('patientId') patientId: string, @Request() req: any) {
    return this.familyHistoryService.getPatientFamilyHistory(patientId, req.user);
  }

  @Post('patient-family-history')
  async savePatientFamilyHistory(@Body() data: any, @Request() req: any) {
    return this.familyHistoryService.savePatientFamilyHistory(data, req.user);
  }

  @Delete('patient-family-history')
  async deletePatientFamilyHistory(@Body() data: any, @Request() req: any) {
    return this.familyHistoryService.deletePatientFamilyHistory(data, req.user);
  }
}
