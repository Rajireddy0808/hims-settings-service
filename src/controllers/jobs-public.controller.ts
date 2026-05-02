import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { JobsService } from '../services/jobs.service';

@Controller('public-jobs')
export class PublicJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }
}
