import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SocialHistoryService } from '../services/social-history.service';

@ApiTags('Social History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SocialHistoryController {
  constructor(private readonly socialHistoryService: SocialHistoryService) {}

  @Get('social-history')
  async getSocialHistory() {
    return this.socialHistoryService.getSocialHistory();
  }

  @Get('social-history-options/:id')
  async getSocialHistoryOptions(@Param('id') id: string) {
    return this.socialHistoryService.getSocialHistoryOptions(parseInt(id));
  }

  @Get('patient-social-history/:patientId')
  async getPatientSocialHistory(@Param('patientId') patientId: string, @Request() req: any) {
    return this.socialHistoryService.getPatientSocialHistory(patientId, req.user);
  }

  @Post('patient-social-history')
  async savePatientSocialHistory(@Body() data: any, @Request() req: any) {
    return this.socialHistoryService.savePatientSocialHistory(data, req.user);
  }

  @Delete('patient-social-history')
  async deletePatientSocialHistory(@Body() data: any, @Request() req: any) {
    return this.socialHistoryService.deletePatientSocialHistory(data, req.user);
  }
}
