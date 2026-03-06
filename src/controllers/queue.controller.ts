import { Controller, Get, Put, Param, Body, Query, UseGuards, Request, Sse, MessageEvent } from '@nestjs/common';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { QueueService } from '../services/queue.service';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) { }

  @Get('doctors')
  @ApiOperation({ summary: 'Get doctors by department with attendance status' })
  @ApiQuery({ name: 'location_id', required: false, type: Number })
  async getDoctorsByDepartment(@Query('location_id') locationId?: number) {
    if (!locationId) return { doctorsByDepartment: {} };
    return this.queueService.getDoctorsByDepartment(locationId);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Get today appointments for queue display grouped by doctor' })
  @ApiQuery({ name: 'location_id', required: false, type: Number })
  async getQueueAppointments(@Query('location_id') locationId?: number) {
    if (!locationId) return { doctors: [] };
    return this.queueService.getQueueAppointments(locationId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('appointments/:id/status')
  @ApiOperation({ summary: 'Update appointment queue status' })
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() body: { status: string }
  ) {
    return this.queueService.updateAppointmentStatus(id, body.status);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test queue API endpoint' })
  async testQueue() {
    return { message: 'Queue API is working', timestamp: new Date().toISOString() };
  }

  @Sse('stream')
  @ApiOperation({ summary: 'Server-Sent Events stream for real-time queue updates' })
  @ApiQuery({ name: 'location_id', required: false, type: Number })
  streamQueueUpdates(@Query('location_id') locationId?: number): Observable<MessageEvent> {
    return this.queueService.queueUpdateSubject.asObservable().pipe(
      filter(event => !locationId || event.locationId === Number(locationId)),
      map(() => ({ data: { timestamp: new Date().toISOString() } } as MessageEvent))
    );
  }
}
