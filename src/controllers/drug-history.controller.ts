import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DrugHistoryService } from '../services/drug-history.service';

@ApiTags('Drug History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DrugHistoryController {
  constructor(private readonly drugHistoryService: DrugHistoryService) {}

  @Get('drug-history')
  async getDrugHistory() {
    return this.drugHistoryService.getDrugHistory();
  }

  @Get('drug-history-options/:id')
  async getDrugHistoryOptions(@Param('id') id: string) {
    return this.drugHistoryService.getDrugHistoryOptions(parseInt(id));
  }

  @Get('patient-drug-history/:patientId')
  async getPatientDrugHistory(@Param('patientId') patientId: string, @Request() req: any) {
    return this.drugHistoryService.getPatientDrugHistory(patientId, req.user);
  }

  @Post('patient-drug-history')
  async savePatientDrugHistory(@Body() data: any, @Request() req: any) {
    return this.drugHistoryService.savePatientDrugHistory(data, req.user);
  }

  @Delete('patient-drug-history')
  async deletePatientDrugHistory(@Body() data: any, @Request() req: any) {
    return this.drugHistoryService.deletePatientDrugHistory(data, req.user);
  }
}
