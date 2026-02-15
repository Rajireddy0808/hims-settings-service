import { Controller, Get, Query } from '@nestjs/common';
import { QueueService } from '../services/queue.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Get('doctors')
  @ApiOperation({ summary: 'Get doctors by department with attendance status' })
  @ApiQuery({ name: 'location_id', required: false, type: Number })
  async getDoctorsByDepartment(@Query('location_id') locationId?: number) {
    return this.queueService.getDoctorsByDepartment(locationId || 1);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test queue API endpoint' })
  async testQueue() {
    return { message: 'Queue API is working', timestamp: new Date().toISOString() };
  }
}
