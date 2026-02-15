import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from '../entities/holiday.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private holidayRepository: Repository<Holiday>,
  ) {}

  async findAll(locationId?: number) {
    const where = locationId ? { locationId } : {};
    return this.holidayRepository.find({
      where,
      order: { date: 'ASC' }
    });
  }

  async findOne(id: number) {
    return this.holidayRepository.findOne({ where: { id } });
  }

  async create(createHolidayDto: any) {
    const holiday = this.holidayRepository.create(createHolidayDto);
    return this.holidayRepository.save(holiday);
  }

  async update(id: number, updateHolidayDto: any) {
    await this.holidayRepository.update(id, updateHolidayDto);
    return this.holidayRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.holidayRepository.delete(id);
    return { message: 'Holiday deleted successfully' };
  }
}
