import { Controller, Post, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobApplicationsService } from '../services/job-applications.service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('public-job-applications')
export class PublicJobApplicationsController {
  constructor(private readonly jobApplicationsService: JobApplicationsService) {}

  @Post('apply')
  @UseInterceptors(FileInterceptor('resume', {
    storage: diskStorage({
      destination: './uploads/resumes',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async apply(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const jobIdValue = body.job_id && body.job_id !== 'general' ? parseInt(body.job_id) : null;
    
    const applicationData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      location: body.location,
      message: body.message,
      job_id: jobIdValue,
      resume_url: file ? `/uploads/resumes/${file.filename}` : null,
    };
    return this.jobApplicationsService.create(applicationData);
  }
}
