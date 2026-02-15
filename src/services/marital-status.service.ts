import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaritalStatus } from '../entities/marital-status.entity';

@Injectable()
export class MaritalStatusService {
  constructor(
    @InjectRepository(MaritalStatus)
    private maritalStatusRepository: Repository<MaritalStatus>,
  ) {}

  async findAll() {
    return this.maritalStatusRepository.find({ where: { is_active: true } });
  }
}
