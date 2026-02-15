import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeeMasters } from '../entities/fee-masters.entity';

@Injectable()
export class FeeMastersService {
  constructor(
    @InjectRepository(FeeMasters)
    private feeMastersRepository: Repository<FeeMasters>,
  ) {}

  async findAll(): Promise<FeeMasters[]> {
    return this.feeMastersRepository.find({
      where: { status: true },
      order: { title: 'ASC' }
    });
  }
}
