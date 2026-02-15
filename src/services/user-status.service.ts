import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';

@Injectable()
export class UserStatusService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async findAll() {
    const result = await this.attendanceRepository.query(
      'SELECT id, name as "statusName", color_code as "colorCode" FROM user_status WHERE status = true ORDER BY name ASC'
    );
    return result;
  }
}
