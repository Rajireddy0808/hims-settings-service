import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PersonalHistoryService } from '../services/personal-history.service';

@ApiTags('Personal History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PersonalHistoryController {
  constructor(private readonly personalHistoryService: PersonalHistoryService) { }

  @Get('personal-history')
  async getPersonalHistory() {
    return this.personalHistoryService.getPersonalHistory();
  }

  @Post('personal-history')
  async createPersonalHistory(@Body() data: any) {
    return this.personalHistoryService.createPersonalHistory(data);
  }

  @Put('personal-history/:id')
  async updatePersonalHistory(@Param('id') id: string, @Body() data: any) {
    return this.personalHistoryService.updatePersonalHistory(parseInt(id), data);
  }

  @Get('personal-history-options/:id')
  async getPersonalHistoryOptions(@Param('id') id: string) {
    return this.personalHistoryService.getPersonalHistoryOptions(parseInt(id));
  }

  @Get('patient-personal-history/:patientId')
  async getPatientPersonalHistory(
    @Param('patientId') patientId: string,
    @Query('location_id') locationId: string,
    @Request() req: any
  ) {
    return this.personalHistoryService.getPatientPersonalHistory(patientId, locationId, req.user);
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
