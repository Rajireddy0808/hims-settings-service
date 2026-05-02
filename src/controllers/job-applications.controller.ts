import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { JobApplicationsService } from '../services/job-applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.jobApplicationsService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      startDate,
      endDate,
      search,
    });
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobApplicationsService.findOne(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jobApplicationsService.remove(id);
  }
}
