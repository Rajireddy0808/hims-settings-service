import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSalaryDetails } from '../entities/user-salary-details.entity';

@Injectable()
export class UserSalaryService {
  constructor(
    @InjectRepository(UserSalaryDetails)
    private salaryRepository: Repository<UserSalaryDetails>,
  ) {}

  async create(data: Partial<UserSalaryDetails>) {
    const salary = this.salaryRepository.create(data);
    return this.salaryRepository.save(salary);
  }

  async findByUserId(userId: number) {
    return this.salaryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }
}
