import { Controller, Post, Get, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatientRegistrationService } from '../services/patient-registration.service';
import { PatientListService } from '../services/patient-list.service';
import { UserLocationService } from '../services/user-location.service';

@ApiTags('Patient Registration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientRegistrationController {
  constructor(
    private readonly patientRegistrationService: PatientRegistrationService,
    private readonly patientListService: PatientListService,
    private readonly userLocationService: UserLocationService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  async getAllPatients(
    @Request() req, 
    @Query('locationId') queryLocationId?: string,
    @Query('patient_source_id') patientSourceId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string
  ) {
    const userId = req.user.sub || req.user.id || req.user.userId;
     const locationId = queryLocationId ? parseInt(queryLocationId) : await this.userLocationService.getUserLocationId(userId);

    
    if (patientSourceId) {
      return this.patientListService.getPatientsBySource(locationId, parseInt(patientSourceId), fromDate, toDate);
    }
    
    return this.patientListService.getAllPatients(locationId, fromDate, toDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  async getPatientById(@Param('id') patientId: string, @Request() req, @Query('locationId') queryLocationId?: string) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    const locationId = queryLocationId ? parseInt(queryLocationId) : await this.userLocationService.getUserLocationId(userId);
    
    // Validate user access to patient data
    return this.patientListService.getPatientById(patientId, locationId, userId);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new patient' })
  async registerPatient(@Request() req, @Body() patientData: any) {
    const userId = req.user.sub || req.user.id || req.user.userId;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Dynamically get user's location ID
    const locationId = await this.userLocationService.getUserLocationId(userId);
    

    
    return this.patientRegistrationService.registerPatient(patientData, locationId, userId);
  }
}
