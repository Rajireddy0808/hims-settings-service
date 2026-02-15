import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlan } from '../entities/treatment-plan.entity';

@Injectable()
export class TreatmentPlansService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private treatmentPlanRepository: Repository<TreatmentPlan>,
  ) {}

  async findAll() {
    return this.treatmentPlanRepository.find({
      order: { months: 'ASC' }
    });
  }

  async findOne(id: number) {
    return this.treatmentPlanRepository.findOne({ where: { id } });
  }

  async create(createTreatmentPlanDto: any) {
    const treatmentPlan = this.treatmentPlanRepository.create(createTreatmentPlanDto);
    return this.treatmentPlanRepository.save(treatmentPlan);
  }

  async update(id: number, updateTreatmentPlanDto: any) {
    await this.treatmentPlanRepository.update(id, updateTreatmentPlanDto);
    return this.treatmentPlanRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.treatmentPlanRepository.delete(id);
    return { message: 'Treatment plan deleted successfully' };
  }
}