import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatientExaminationService } from '../services/patient-examination.service';

@Controller('patient-examination')
@UseGuards(JwtAuthGuard)
export class PatientExaminationController {
  constructor(private readonly patientExaminationService: PatientExaminationService) {}

  @Post()
  async create(@Body() createExaminationDto: any, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.patientExaminationService.create(createExaminationDto, userId);
  }

  @Get('due-patients/all')
  async getDuePatients(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return this.patientExaminationService.getDuePatients(parseInt(page), parseInt(limit));
  }

  @Get('nr-list/all')
  async getNRList(
    @Query('page') page: string = '1', 
    @Query('limit') limit: string = '10',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.patientExaminationService.getNRList(parseInt(page), parseInt(limit), fromDate, toDate);
  }

  @Get('nr-list/test')
  async testNRList() {
    return { message: 'NR List endpoint is working', timestamp: new Date() };
  }

  @Get('debug/:id')
  async debugExamination(@Param('id') id: number) {
    return this.patientExaminationService.debugExamination(id);
  }

  @Get('installment/:installmentId/receipt')
  async getInstallmentReceipt(@Param('installmentId') installmentId: number) {
    return this.patientExaminationService.getInstallmentReceipt(installmentId);
  }

  @Get(':patientId')
  async findByPatientId(@Param('patientId') patientId: string) {
    return this.patientExaminationService.findByPatientId(patientId);
  }

  @Get(':patientId/latest')
  async findLatestByPatientId(@Param('patientId') patientId: string) {
    return this.patientExaminationService.findLatestByPatientId(patientId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateExaminationDto: any) {
    return this.patientExaminationService.update(id, updateExaminationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.patientExaminationService.remove(id);
  }

  @Post(':id/payments')
  async savePayments(@Param('id') id: number, @Body() paymentData: any) {
    return this.patientExaminationService.savePayments(id, paymentData);
  }

  @Get(':id/payments')
  async getPayments(@Param('id') id: number) {
    return this.patientExaminationService.getPayments(id);
  }



  @Post(':id/add-payment')
  async addPayment(@Param('id') id: number, @Body() paymentData: { paymentMethod: string; amount: number; notes?: string }) {
    return this.patientExaminationService.addPayment(id, paymentData);
  }

  @Get(':id/installments')
  async getPaymentInstallments(@Param('id') id: number) {
    return this.patientExaminationService.getPaymentInstallments(id);
  }

  @Get(':id/receipt')
  async getPaymentReceipt(@Param('id') id: number) {
    return this.patientExaminationService.getPaymentReceipt(id);
  }

  @Get(':id/daily-receipt')
  async getDailyReceipt(@Param('id') id: number) {
    return this.patientExaminationService.getDailyReceipt(id);
  }
}
