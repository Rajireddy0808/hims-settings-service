import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlanMonth } from '../entities/treatment-plan-month.entity';

@Injectable()
export class TreatmentPlanMonthService {
  constructor(
    @InjectRepository(TreatmentPlanMonth)
    private treatmentPlanMonthRepository: Repository<TreatmentPlanMonth>,
  ) {}

  async findAll(): Promise<TreatmentPlanMonth[]> {
    return this.treatmentPlanMonthRepository.find({
      order: { id: 'ASC' },
    });
  }
}
