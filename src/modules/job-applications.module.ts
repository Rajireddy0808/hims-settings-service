import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from '../entities/job-application.entity';
import { JobApplicationsService } from '../services/job-applications.service';
import { JobApplicationsController } from '../controllers/job-applications.controller';
import { PublicJobApplicationsController } from '../controllers/job-applications-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobApplication])],
  providers: [JobApplicationsService],
  controllers: [JobApplicationsController, PublicJobApplicationsController],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
