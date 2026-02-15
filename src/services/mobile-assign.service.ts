import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileNumber } from '../entities/mobile-number.entity';

@Injectable()
export class MobileAssignService {
  constructor(
    @InjectRepository(MobileNumber)
    private mobileNumberRepository: Repository<MobileNumber>,
  ) {}

  async getUnassignedNumbers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const data = await this.mobileNumberRepository.query(
      'SELECT * FROM mobile_numbers WHERE user_id IS NULL ORDER BY id LIMIT $1 OFFSET $2',
      [limit, skip]
    );
    
    const countResult = await this.mobileNumberRepository.query(
      'SELECT COUNT(*) as total FROM mobile_numbers WHERE user_id IS NULL'
    );
    
    const total = parseInt(countResult[0].total);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUsers(locationId: string) {
    const query = `
      SELECT id, username, first_name, last_name 
      FROM users 
      WHERE is_active = true
      ORDER BY first_name, last_name
    `;
    
    return this.mobileNumberRepository.query(query);
  }

  async assignNumbers(mobileIds: number[], userId: number, assignedBy: number) {
    await this.mobileNumberRepository
      .createQueryBuilder()
      .update(MobileNumber)
      .set({ user_id: userId, updated_at: new Date() })
      .whereInIds(mobileIds)
      .execute();

    return {
      success: true,
      message: `Successfully assigned ${mobileIds.length} numbers to user`,
      count: mobileIds.length
    };
  }
}