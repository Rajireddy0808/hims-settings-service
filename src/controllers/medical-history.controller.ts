import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MedicalHistoryService } from '../services/medical-history.service';

@ApiTags('Medical History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) { }

  @Get('medical-history')
  async getMedicalHistory(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getMedicalHistory(locationId ? parseInt(locationId) : undefined);
  }

  @Post('medical-history')
  async createMedicalHistory(@Body() data: any) {
    return this.medicalHistoryService.createMedicalHistory(data);
  }

  @Put('medical-history/:id')
  async updateMedicalHistory(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateMedicalHistory(id, data);
  }



  @Get('medical-history-options/:id')
  async getMedicalHistoryOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getMedicalHistoryOptions(parseInt(id));
  }

  @Post('medical-history-options')
  async createMedicalHistoryOption(@Body() data: any) {
    return this.medicalHistoryService.createMedicalHistoryOption(data);
  }

  @Put('medical-history-options/:id')
  async updateMedicalHistoryOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateMedicalHistoryOption(id, data);
  }

  @Get('medical-history-options')
  async getAllMedicalHistoryOptions() {
    return this.medicalHistoryService.getAllMedicalHistoryOptions();
  }

  @Get('personal-history')
  @ApiOperation({ summary: 'Get all personal history' })
  async getPersonalHistory(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getPersonalHistory(locationId ? parseInt(locationId) : undefined);
  }

  @Post('personal-history')
  @ApiOperation({ summary: 'Create personal history' })
  async createPersonalHistory(@Body() data: any) {
    return this.medicalHistoryService.createPersonalHistory(data);
  }

  @Put('personal-history/:id')
  @ApiOperation({ summary: 'Update personal history' })
  async updatePersonalHistory(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updatePersonalHistory(id, data);
  }

  @Get('personal-history-options/:id')
  @ApiOperation({ summary: 'Get personal history options by ID' })
  async getPersonalHistoryOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getPersonalHistoryOptions(parseInt(id));
  }

  @Post('personal-history-options')
  @ApiOperation({ summary: 'Create personal history option' })
  async createPersonalHistoryOption(@Body() data: any) {
    return this.medicalHistoryService.createPersonalHistoryOption(data);
  }

  @Put('personal-history-options/:id')
  @ApiOperation({ summary: 'Update personal history option' })
  async updatePersonalHistoryOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updatePersonalHistoryOption(id, data);
  }

  @Get('personal-history-options')
  @ApiOperation({ summary: 'Get all personal history options' })
  async getAllPersonalHistoryOptions() {
    return this.medicalHistoryService.getAllPersonalHistoryOptions();
  }

  @Get('lifestyle')
  @ApiOperation({ summary: 'Get all lifestyle' })
  async getLifestyle(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getLifestyle(locationId ? parseInt(locationId) : undefined);
  }

  @Post('lifestyle')
  @ApiOperation({ summary: 'Create lifestyle' })
  async createLifestyle(@Body() data: any) {
    return this.medicalHistoryService.createLifestyle(data);
  }

  @Put('lifestyle/:id')
  @ApiOperation({ summary: 'Update lifestyle' })
  async updateLifestyle(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateLifestyle(id, data);
  }

  @Get('lifestyle-options/:id')
  @ApiOperation({ summary: 'Get lifestyle options by ID' })
  async getLifestyleOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getLifestyleOptions(parseInt(id));
  }

  @Post('lifestyle-options')
  @ApiOperation({ summary: 'Create lifestyle option' })
  async createLifestyleOption(@Body() data: any) {
    return this.medicalHistoryService.createLifestyleOption(data);
  }

  @Put('lifestyle-options/:id')
  @ApiOperation({ summary: 'Update lifestyle option' })
  async updateLifestyleOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateLifestyleOption(id, data);
  }

  @Get('lifestyle-options')
  @ApiOperation({ summary: 'Get all lifestyle options' })
  async getAllLifestyleOptions() {
    return this.medicalHistoryService.getAllLifestyleOptions();
  }

  @Get('family-history')
  @ApiOperation({ summary: 'Get all family history' })
  async getFamilyHistory(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getFamilyHistory(locationId ? parseInt(locationId) : undefined);
  }

  @Post('family-history')
  @ApiOperation({ summary: 'Create family history' })
  async createFamilyHistory(@Body() data: any) {
    return this.medicalHistoryService.createFamilyHistory(data);
  }

  @Put('family-history/:id')
  @ApiOperation({ summary: 'Update family history' })
  async updateFamilyHistory(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateFamilyHistory(id, data);
  }

  @Get('family-history-options/:id')
  @ApiOperation({ summary: 'Get family history options by ID' })
  async getFamilyHistoryOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getFamilyHistoryOptions(parseInt(id));
  }

  @Post('family-history-options')
  @ApiOperation({ summary: 'Create family history option' })
  async createFamilyHistoryOption(@Body() data: any) {
    return this.medicalHistoryService.createFamilyHistoryOption(data);
  }

  @Put('family-history-options/:id')
  @ApiOperation({ summary: 'Update family history option' })
  async updateFamilyHistoryOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateFamilyHistoryOption(id, data);
  }

  @Get('family-history-options')
  @ApiOperation({ summary: 'Get all family history options' })
  async getAllFamilyHistoryOptions() {
    return this.medicalHistoryService.getAllFamilyHistoryOptions();
  }

  @Get('drug-history')
  @ApiOperation({ summary: 'Get all drug history' })
  async getDrugHistory(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getDrugHistory(locationId ? parseInt(locationId) : undefined);
  }

  @Post('drug-history')
  @ApiOperation({ summary: 'Create drug history' })
  async createDrugHistory(@Body() data: any) {
    return this.medicalHistoryService.createDrugHistory(data);
  }

  @Put('drug-history/:id')
  @ApiOperation({ summary: 'Update drug history' })
  async updateDrugHistory(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateDrugHistory(id, data);
  }

  @Get('drug-history-options/:id')
  @ApiOperation({ summary: 'Get drug history options by ID' })
  async getDrugHistoryOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getDrugHistoryOptions(parseInt(id));
  }

  @Post('drug-history-options')
  @ApiOperation({ summary: 'Create drug history option' })
  async createDrugHistoryOption(@Body() data: any) {
    return this.medicalHistoryService.createDrugHistoryOption(data);
  }

  @Put('drug-history-options/:id')
  @ApiOperation({ summary: 'Update drug history option' })
  async updateDrugHistoryOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateDrugHistoryOption(id, data);
  }

  @Get('drug-history-options')
  @ApiOperation({ summary: 'Get all drug history options' })
  async getAllDrugHistoryOptions() {
    return this.medicalHistoryService.getAllDrugHistoryOptions();
  }

  @Get('allergies')
  @ApiOperation({ summary: 'Get all allergies' })
  async getAllergies(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getAllergies(locationId ? parseInt(locationId) : undefined);
  }

  @Post('allergies')
  @ApiOperation({ summary: 'Create allergy' })
  async createAllergy(@Body() data: any) {
    return this.medicalHistoryService.createAllergy(data);
  }

  @Put('allergies/:id')
  @ApiOperation({ summary: 'Update allergy' })
  async updateAllergy(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateAllergy(id, data);
  }

  @Get('allergies-options/:id')
  @ApiOperation({ summary: 'Get allergy options by ID' })
  async getAllergiesOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getAllergiesOptions(parseInt(id));
  }

  @Post('allergies-options')
  @ApiOperation({ summary: 'Create allergy option' })
  async createAllergyOption(@Body() data: any) {
    return this.medicalHistoryService.createAllergyOption(data);
  }

  @Put('allergies-options/:id')
  @ApiOperation({ summary: 'Update allergy option' })
  async updateAllergyOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateAllergyOption(id, data);
  }

  @Get('allergies-options')
  @ApiOperation({ summary: 'Get all allergy options' })
  async getAllAllergiesOptions() {
    return this.medicalHistoryService.getAllAllergiesOptions();
  }

  @Get('social-history')
  @ApiOperation({ summary: 'Get all social history' })
  async getSocialHistory(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getSocialHistory(locationId ? parseInt(locationId) : undefined);
  }

  @Post('social-history')
  @ApiOperation({ summary: 'Create social history' })
  async createSocialHistory(@Body() data: any) {
    return this.medicalHistoryService.createSocialHistory(data);
  }

  @Put('social-history/:id')
  @ApiOperation({ summary: 'Update social history' })
  async updateSocialHistory(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateSocialHistory(id, data);
  }

  @Get('social-history-options/:id')
  @ApiOperation({ summary: 'Get social history options by ID' })
  async getSocialHistoryOptions(@Param('id') id: string) {
    return this.medicalHistoryService.getSocialHistoryOptions(parseInt(id));
  }

  @Post('social-history-options')
  @ApiOperation({ summary: 'Create social history option' })
  async createSocialHistoryOption(@Body() data: any) {
    return this.medicalHistoryService.createSocialHistoryOption(data);
  }

  @Put('social-history-options/:id')
  @ApiOperation({ summary: 'Update social history option' })
  async updateSocialHistoryOption(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateSocialHistoryOption(id, data);
  }

  @Get('social-history-options')
  @ApiOperation({ summary: 'Get all social history options' })
  async getAllSocialHistoryOptions() {
    return this.medicalHistoryService.getAllSocialHistoryOptions();
  }

  @Get('medication-type')
  @ApiOperation({ summary: 'Get all medication types' })
  async getMedicationType(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getMedicationType(locationId ? parseInt(locationId) : undefined);
  }

  @Post('medication-type')
  @ApiOperation({ summary: 'Create medication type' })
  async createMedicationType(@Body() data: any) {
    return this.medicalHistoryService.createMedicationType(data);
  }

  @Put('medication-type/:id')
  @ApiOperation({ summary: 'Update medication type' })
  async updateMedicationType(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateMedicationType(id, data);
  }

  @Get('medicine')
  @ApiOperation({ summary: 'Get all medicine' })
  async getMedicine(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getMedicine(locationId ? parseInt(locationId) : undefined);
  }

  @Post('medicine')
  @ApiOperation({ summary: 'Create medicine' })
  async createMedicine(@Body() data: any) {
    return this.medicalHistoryService.createMedicine(data);
  }

  @Put('medicine/:id')
  @ApiOperation({ summary: 'Update medicine' })
  async updateMedicine(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateMedicine(id, data);
  }

  @Get('potency')
  @ApiOperation({ summary: 'Get all potency' })
  async getPotency(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getPotency(locationId ? parseInt(locationId) : undefined);
  }

  @Post('potency')
  @ApiOperation({ summary: 'Create potency' })
  async createPotency(@Body() data: any) {
    return this.medicalHistoryService.createPotency(data);
  }

  @Put('potency/:id')
  @ApiOperation({ summary: 'Update potency' })
  async updatePotency(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updatePotency(id, data);
  }

  @Get('dosage')
  @ApiOperation({ summary: 'Get all dosage' })
  async getDosage(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getDosage(locationId ? parseInt(locationId) : undefined);
  }

  @Post('dosage')
  @ApiOperation({ summary: 'Create dosage' })
  async createDosage(@Body() data: any) {
    return this.medicalHistoryService.createDosage(data);
  }

  @Put('dosage/:id')
  @ApiOperation({ summary: 'Update dosage' })
  async updateDosage(@Param('id') id: number, @Body() data: any) {
    return this.medicalHistoryService.updateDosage(id, data);
  }

  @Get('pharmacy/prescriptions')
  @ApiOperation({ summary: 'Get pharmacy prescriptions with patient and medicine details' })
  async getPharmacyPrescriptions(@Query('location_id') locationId?: string) {
    return this.medicalHistoryService.getPharmacyPrescriptions(locationId ? parseInt(locationId) : undefined);
  }

  @Put('pharmacy/prescriptions/:id/status')
  @ApiOperation({ summary: 'Update prescription status' })
  async updatePrescriptionStatus(@Param('id') id: number, @Body() data: { status: number }) {
    return this.medicalHistoryService.updatePrescriptionStatus(id, data.status);
  }

  @Get('patient-examinations')
  @ApiOperation({ summary: 'Get patient examinations with patient details' })
  async getPatientExaminations(
    @Query('location_id') locationId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('search') search?: string
  ) {
    return this.medicalHistoryService.getPatientExaminations(locationId ? parseInt(locationId) : undefined, parseInt(page), parseInt(limit), fromDate, toDate, search);
  }

  @Get('patient-medical-history/:patientId')
  async getPatientMedicalHistory(@Param('patientId') patientId: string, @Request() req: any) {
    return this.medicalHistoryService.getPatientMedicalHistory(patientId, req.user);
  }

  @Post('patient-medical-history')
  async savePatientMedicalHistory(@Body() data: any, @Request() req: any) {
    return this.medicalHistoryService.savePatientMedicalHistory(data, req.user);
  }

  @Delete('patient-medical-history')
  async deletePatientMedicalHistory(@Body() data: any, @Request() req: any) {
    return this.medicalHistoryService.deletePatientMedicalHistory(data, req.user);
  }
}
