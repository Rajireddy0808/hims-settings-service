import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from '../services/attendance.service';
import { CreateAttendanceDto, UpdateAttendanceDto, CheckInOutDto, UpdateAvailableStatusDto } from '../dto/attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Post('check-in-out')
  async checkInOut(@Body() checkInOutDto: CheckInOutDto) {
    return await this.attendanceService.checkInOut(checkInOutDto);
  }

  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return await this.attendanceService.create(createAttendanceDto);
  }

  @Get()
  async findAll(
    @Query('locationId') locationId?: number,
    @Query('userId') userId?: number,
    @Query('date') date?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.attendanceService.findAll(locationId, userId, date, page, limit);
  }

  @Get('user/:userId/today')
  async getUserTodayAttendance(
    @Param('userId') userId: number,
    @Query('locationId') locationId: number,
  ) {
    return await this.attendanceService.getUserTodayAttendance(userId, locationId);
  }

  @Get('user/:userId/date/:date')
  async getAttendanceByDate(
    @Param('userId') userId: number,
    @Param('date') date: string,
    @Query('locationId') locationId: number,
  ) {
    return await this.attendanceService.getAttendanceByDate(userId, locationId, date);
  }

  @Get('user/:userId/grouped')
  async getGroupedAttendance(
    @Param('userId') userId: number,
    @Query('locationId') locationId: number,
  ) {
    return await this.attendanceService.getGroupedAttendance(userId, locationId);
  }

  @Get('user/:userId/user-leaves')
  async getGroupedAttendancePaginated(
    @Param('userId') userId: number,
    @Query('locationId') locationId: number,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return await this.attendanceService.getGroupedAttendancePaginated(userId, locationId, parseInt(page), parseInt(limit));
  }



  @Get('user/:userId/duration')
  async getTotalDuration(
    @Param('userId') userId: number,
    @Query('locationId') locationId: number,
    @Query('date') date: string,
  ) {
    const duration = await this.attendanceService.getTotalDuration(userId, locationId, date);
    return { userId, locationId, date, totalDuration: duration };
  }

  @Get('user/:userId/stats')
  async getAttendanceStats(
    @Param('userId') userId: number,
    @Query('locationId') locationId: number,
  ) {
    return await this.attendanceService.getAttendanceStats(userId, locationId);
  }

  @Patch('available-status')
  async updateAvailableStatus(@Body() updateStatusDto: UpdateAvailableStatusDto) {

    return await this.attendanceService.updateAvailableStatus(
      Number(updateStatusDto.userId),
      Number(updateStatusDto.locationId),
      updateStatusDto.userStatusId
    );
  }

  @Get('leaves')
  async getLeaveApplications(
    @Query('locationId') locationId?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const locationIdNum = locationId ? parseInt(locationId) : undefined;
    const userIdNum = userId ? parseInt(userId) : undefined;
    const pageNum = page ? parseInt(page) : undefined;
    const limitNum = limit ? parseInt(limit) : undefined;

    return await this.attendanceService.getLeaveApplications(locationIdNum, userIdNum, pageNum, limitNum, fromDate, toDate);
  }

  @Get('search')
  async searchDoctors(
    @Query('searchTerm') searchTerm: string,
    @Query('locationId') locationId: number,
  ) {
    return await this.attendanceService.searchDoctors(searchTerm, locationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.attendanceService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return await this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.attendanceService.remove(id);
    return { message: 'Attendance record deleted successfully' };
  }

  @Post('summary')
  async getAttendanceReport(
    @Body() body: { locationId: number, fromMonth?: string, toMonth?: string, departmentId?: number, userId?: number, page?: number, limit?: number }
  ) {
    return await this.attendanceService.getAttendanceReport(body.locationId, body.fromMonth, body.toMonth, body.departmentId, body.userId, body.page || 1, body.limit || 10);
  }

  @Post('report')
  async getDetailedAttendanceReport(
    @Body() body: { locationId: number, fromDate?: string, toDate?: string, departmentId?: number, userId?: number, page?: number, limit?: number }
  ) {

    return await this.attendanceService.getDetailedAttendanceReport(body.locationId, body.fromDate, body.toDate, body.departmentId, body.userId, body.page || 1, body.limit || 10);
  } 

}
