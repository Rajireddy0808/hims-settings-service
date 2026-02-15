import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentType } from '../entities/appointment-type.entity';

@Injectable()
export class AppointmentTypeService {
  constructor(
    @InjectRepository(AppointmentType)
    private appointmentTypeRepository: Repository<AppointmentType>,
  ) {}

  async findAll(locationId?: number): Promise<AppointmentType[]> {
    const queryBuilder = this.appointmentTypeRepository
      .createQueryBuilder('appointmentType')
      .where('appointmentType.is_active = :isActive', { isActive: true });

    if (locationId) {
      queryBuilder.andWhere(
        '(appointmentType.location_id = :locationId OR appointmentType.location_id IS NULL)',
        { locationId }
      );
    }

    return queryBuilder
      .orderBy('appointmentType.name', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<AppointmentType> {
    return this.appointmentTypeRepository.findOne({
      where: { id, is_active: true }
    });
  }

  async create(appointmentTypeData: Partial<AppointmentType>): Promise<AppointmentType> {
    const appointmentType = this.appointmentTypeRepository.create(appointmentTypeData);
    return this.appointmentTypeRepository.save(appointmentType);
  }

  async update(id: number, appointmentTypeData: Partial<AppointmentType>): Promise<AppointmentType> {
    await this.appointmentTypeRepository.update(id, appointmentTypeData);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.appointmentTypeRepository.update(id, { is_active: false });
  }
}