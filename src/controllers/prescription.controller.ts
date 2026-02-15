import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrescriptionService } from '../services/prescription.service';
import { UserLocationService } from '../services/user-location.service';

@ApiTags('Prescription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PrescriptionController {
  constructor(
    private readonly prescriptionService: PrescriptionService,
    private readonly userLocationService: UserLocationService
  ) {}

  @Get('patient-prescriptions/:patientId')
  async getPatientPrescriptions(@Param('patientId') patientId: string, @Request() req: any) {
    return this.prescriptionService.getPatientPrescriptions(patientId, req.user);
  }

  @Post('patient-prescriptions')
  async savePatientPrescriptions(@Body() data: any, @Request() req: any) {
    return this.prescriptionService.savePatientPrescriptions(data, req.user);
  }

  @Delete('patient-prescriptions/:id')
  async deletePatientPrescription(@Param('id') id: string, @Request() req: any) {
    return this.prescriptionService.deletePatientPrescription(parseInt(id), req.user);
  }
}
