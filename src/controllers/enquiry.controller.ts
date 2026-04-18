import { Controller, Get, Post, Body, UseGuards, Query, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { EnquiryService } from '../services/enquiry.service';

@ApiTags('Enquiry')
@Controller('enquiry')
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Post('book')
  @ApiOperation({ summary: 'Submit an online appointment lead' })
  async bookAppointment(@Body() bookingData: any) {
    // Map the incoming public form data to the Enquiry entity
    const enquiryData = {
      name: bookingData.name,
      phone: bookingData.phone,
      medical_problems: bookingData.reason || bookingData.medical_problems
    };

    return this.enquiryService.createEnquiry(enquiryData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all enquiries with optional date filters' })
  async getAllEnquiries(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const enquiries = await this.enquiryService.findAllEnquiries(fromDate, toDate);
    // Explicitly mapping to ensure all fields, including 'userview', are serialized in the response
    return enquiries.map(enquiry => ({
      id: enquiry.id,
      name: enquiry.name,
      phone: enquiry.phone,
      medical_problems: enquiry.medical_problems,
      userview: enquiry.userview,
      created_at: enquiry.created_at,
      updated_at: enquiry.updated_at
    }));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a manual enquiry' })
  async createManualEnquiry(@Body() enquiryData: any) {
    return this.enquiryService.createEnquiry(enquiryData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark enquiry as read' })
  async markAsRead(@Param('id') id: string) {
    return this.enquiryService.markAsRead(parseInt(id));
  }
}
