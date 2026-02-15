import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonalHistoryService } from '../services/personal-history.service';

@ApiTags('Personal History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PersonalHistoryController {
  constructor(private readonly personalHistoryService: PersonalHistoryService) {}

  @Get('personal-history')
  async getPersonalHistory() {
    return this.personalHistoryService.getPersonalHistory();
  }

  @Get('personal-history-options/:id')
  async getPersonalHistoryOptions(@Param('id') id: string) {
    return this.personalHistoryService.getPersonalHistoryOptions(parseInt(id));
  }

  @Get('patient-personal-history/:patientId')
  async getPatientPersonalHistory(@Param('patientId') patientId: string, @Request() req: any) {
    return this.personalHistoryService.getPatientPersonalHistory(patientId, req.user);
  }

  @Post('patient-personal-history')
  async savePatientPersonalHistory(@Body() data: any, @Request() req: any) {
    return this.personalHistoryService.savePatientPersonalHistory(data, req.user);
  }

  @Delete('patient-personal-history')
  async deletePatientPersonalHistory(@Body() data: any, @Request() req: any) {
    return this.personalHistoryService.deletePatientPersonalHistory(data, req.user);
  }
}
