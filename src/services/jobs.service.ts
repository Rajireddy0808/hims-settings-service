import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {}

  async findAll() {
    return await this.jobRepository.find({
      where: { is_active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdmin(page: number = 1, limit: number = 10, search?: string) {
    const query = this.jobRepository.createQueryBuilder('job');

    if (search) {
      query.where('job.title ILIKE :search OR job.location ILIKE :search OR job.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    query.orderBy('job.createdAt', 'DESC');
    
    const [items, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(id: number) {
    const job = await this.jobRepository.findOne({ where: { id } });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(data: Partial<Job>) {
    const job = this.jobRepository.create(data);
    return await this.jobRepository.save(job);
  }

  async update(id: number, data: Partial<Job>) {
    await this.findOne(id);
    await this.jobRepository.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const job = await this.findOne(id);
    return await this.jobRepository.remove(job);
  }
}
