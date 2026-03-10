import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PresentingComplaintsService } from '../services/presenting-complaints.service';

@ApiTags('Presenting Complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patient-presenting-complaints')
export class PresentingComplaintsController {
    constructor(private readonly presentingComplaintsService: PresentingComplaintsService) { }

    @Post()
    @ApiOperation({ summary: 'Save patient presenting complaints' })
    async savePatientPresentingComplaints(@Body() data: any, @Request() req: any) {
        return this.presentingComplaintsService.savePatientPresentingComplaints(data, req.user);
    }

    @Get(':patientId')
    @ApiOperation({ summary: 'Get patient presenting complaints history' })
    async getPatientPresentingComplaints(@Param('patientId') patientId: string) {
        return this.presentingComplaintsService.getPatientPresentingComplaints(patientId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a patient presenting complaint' })
    async deletePatientPresentingComplaint(@Param('id') id: string, @Request() req: any) {
        return this.presentingComplaintsService.deletePatientPresentingComplaint(parseInt(id), req.user);
    }
}
