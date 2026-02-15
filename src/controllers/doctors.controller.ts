import { Controller, Get, Post, Put, Body, Query, Param, UseGuards } from '@nestjs/common';
import { DoctorsService } from '../services/doctors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('users')
  async getDoctors(@Query('locationId') locationId?: number) {
    return this.doctorsService.getDoctors(locationId);
  }

  @Get('timeslots')
  async getDoctorTimeslots(
    @Query('locationId') locationId?: number,
    @Query('userId') userId?: number,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    return this.doctorsService.getDoctorTimeslots(locationId, userId, fromDate, toDate);
  }

  @Get('timeslots/all')
  async getAllDoctorTimeslots(@Query('locationId') locationId?: number) {
    return this.doctorsService.getAllDoctorTimeslots(locationId);
  }

  @Post('timeslots/bulk')
  async createBulkTimeslots(@Body() data: { 
    userId: number; 
    date: string; 
    fromTime: string;
    toTime: string;
    duration: number;
    locationId: number 
  }) {

    return this.doctorsService.createBulkTimeslots(data);
  }

  @Put('timeslots/:id/status')
  async updateTimeslotStatus(
    @Param('id') id: number,
    @Body() data: { isActive: boolean }
  ) {
    return this.doctorsService.updateTimeslotStatus(id, data.isActive);
  }

  @Get('consultation-fees')
  async getConsultationFees(@Query('locationId') locationId?: number) {
    return this.doctorsService.getConsultationFees(locationId);
  }

  @Post('consultation-fees')
  async createConsultationFee(@Body() data: { userId: number; cashFee: number; locationId: number; departmentId: number }) {
    return this.doctorsService.createConsultationFee(data);
  }

  @Put('consultation-fees/:id')
  async updateConsultationFee(
    @Param('id') id: number,
    @Body() data: { userId: number; cashFee: number; locationId?: number; departmentId?: number }
  ) {
    return this.doctorsService.updateConsultationFee(id, data);
  }

  @Put('consultation-fees/:id/delete')
  async deleteConsultationFee(@Param('id') id: number) {
    return this.doctorsService.deleteConsultationFee(id);
  }
}
