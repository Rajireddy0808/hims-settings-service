import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, ILike } from 'typeorm';
import { JobApplication } from '../entities/job-application.entity';

@Injectable()
export class JobApplicationsService {
  constructor(
    @InjectRepository(JobApplication)
    private readonly jobApplicationRepository: Repository<JobApplication>,
  ) {}

  async create(data: Partial<JobApplication>): Promise<JobApplication> {
    const application = this.jobApplicationRepository.create(data);
    return this.jobApplicationRepository.save(application);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<{ items: JobApplication[]; total: number }> {
    const { page = 1, limit = 10, startDate, endDate, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.jobApplicationRepository.createQueryBuilder('application')
      .leftJoinAndSelect('application.job', 'job')
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (startDate && endDate) {
      // Use the property name 'createdAt' which TypeORM maps to 'created_at'
      queryBuilder.andWhere('application.createdAt BETWEEN :startDate AND :endDate', { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate) 
      });
    } else if (startDate) {
      queryBuilder.andWhere('application.createdAt >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      queryBuilder.andWhere('application.createdAt <= :endDate', { endDate: new Date(endDate) });
    }

    if (search) {
      queryBuilder.andWhere(
        '(application.name ILIKE :search OR application.email ILIKE :search OR application.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return { items, total };
  }

  async findOne(id: number): Promise<JobApplication> {
    return this.jobApplicationRepository.findOne({ 
      where: { id },
      relations: ['job']
    });
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.jobApplicationRepository.delete(id);
    return result.affected > 0;
  }
}
