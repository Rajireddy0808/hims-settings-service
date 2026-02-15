import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodGroup } from '../entities/blood-group.entity';

@Injectable()
export class BloodGroupService {
  constructor(
    @InjectRepository(BloodGroup)
    private bloodGroupRepository: Repository<BloodGroup>,
  ) {}

  async findAll() {
    return this.bloodGroupRepository.find({ where: { is_active: true } });
  }
}
