import { Controller, Get, Post, Put, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentService } from '../services/appointment.service';
import { UserLocationService } from '../services/user-location.service';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly userLocationService: UserLocationService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  async getAppointments(
    @Request() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('locationId') queryLocationId?: string,
    @Query('doctorId') doctorId?: string
  ) {
    // Always use the current location_id from query (current location user is in)
    const locationId = queryLocationId ? parseInt(queryLocationId) : null;
    
    if (!locationId) {
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
    
    return this.appointmentService.getAppointments({
      fromDate,
      toDate,
      status,
      search,
      page: parseInt(page.toString()),
      limit: parseInt(limit.toString()),
      locationId,
      doctorId: doctorId ? parseInt(doctorId) : undefined
    });
  }

  @Get('my-appointments')
  @ApiOperation({ summary: 'Get logged-in doctor appointments' })
  async getMyAppointments(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string
  ) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    return this.appointmentService.getDoctorAppointmentsWithUserDetails(
      userId,
      page,
      limit,
      fromDate,
      toDate
    );
  }

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get doctor appointments with user details' })
  async getDoctorAppointments(
    @Request() req,
    @Param('doctorId') doctorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    return this.appointmentService.getDoctorAppointmentsWithUserDetails(
      parseInt(doctorId),
      page,
      limit
    );
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get patient appointments' })
  async getPatientAppointments(@Request() req, @Param('patientId') patientId: number) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    const locationId = userId ? await this.userLocationService.getUserLocationId(userId) : null;
    return this.appointmentService.getPatientAppointments(patientId, locationId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new appointment' })
  async createAppointment(@Request() req, @Body() appointmentData: any) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Dynamically get user's location ID
    const locationId = await this.userLocationService.getUserLocationId(userId);
    

    
    return this.appointmentService.createAppointment(appointmentData, locationId);
  }

  @Put('next-call-date/:patientId')
  @ApiOperation({ summary: 'Update next call date for patient' })
  async updateNextCallDate(
    @Request() req,
    @Param('patientId') patientId: string,
    @Body() updateData: { nextCallDate: string }
  ) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    const locationId = await this.userLocationService.getUserLocationId(userId);
    
    return this.appointmentService.updateNextCallDate(
      parseInt(patientId),
      updateData.nextCallDate,
      userId,
      locationId
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  async getAppointmentById(@Param('id') id: string) {
    return this.appointmentService.getAppointmentById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  async updateAppointment(
    @Param('id') id: string,
    @Body() updateData: any
  ) {
    return this.appointmentService.updateAppointment(id, updateData);
  }
}
