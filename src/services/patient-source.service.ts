import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientSource } from '../entities/patient-source.entity';

@Injectable()
export class PatientSourceService {
  constructor(
    @InjectRepository(PatientSource)
    private patientSourceRepository: Repository<PatientSource>,
  ) {}

  async findAll(): Promise<PatientSource[]> {
    return this.patientSourceRepository.find({
      where: { status: true },
      order: { title: 'ASC' }
    });
  }

  async create(data: any) {
    const existing = await this.patientSourceRepository.findOne({
      where: { title: data.title }
    });
    if (existing) {
      throw new ConflictException('Patient source already exists');
    }
    
    const patientSource = this.patientSourceRepository.create(data);
    return this.patientSourceRepository.save(patientSource);
  }

  async update(id: number, data: any) {
    const patientSource = await this.patientSourceRepository.findOne({ where: { id } });
    if (!patientSource) {
      throw new NotFoundException('Patient source not found');
    }
    
    await this.patientSourceRepository.update(id, data);
    return this.patientSourceRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const patientSource = await this.patientSourceRepository.findOne({ where: { id } });
    if (!patientSource) {
      throw new NotFoundException('Patient source not found');
    }
    
    await this.patientSourceRepository.update(id, { status: false });
    return { message: 'Patient source deleted successfully' };
  }
}
