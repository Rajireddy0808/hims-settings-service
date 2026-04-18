import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EnquiryService } from '../services/enquiry.service';

@ApiTags('Public Appointments')
@Controller('public-appointments')
export class PublicAppointmentsController {
  constructor(
    private readonly enquiryService: EnquiryService
  ) { }

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
}
