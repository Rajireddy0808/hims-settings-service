import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileNumber } from '../entities/mobile-number.entity';

@Injectable()
export class CallHistoryService {
  constructor(
    @InjectRepository(MobileNumber)
    private mobileNumberRepository: Repository<MobileNumber>,
  ) {}

  async getAllCallHistory(page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `SELECT m.*, u.first_name, u.last_name, u.username
                 FROM mobile_numbers m
                 LEFT JOIN users u ON m.caller_by = u.id
                 WHERE m.caller_created_at IS NOT NULL`;
    
    let countQuery = `SELECT COUNT(*) as total FROM mobile_numbers m WHERE m.caller_created_at IS NOT NULL`;
    let params: (number | string)[] = [];
    let countParams: (number | string)[] = [];
    
    if (locationId) {
      query += ` AND m.location_id = $${params.length + 1}`;
      countQuery += ` AND m.location_id = $${countParams.length + 1}`;
      params.push(locationId);
      countParams.push(locationId);
    }
    
    if (fromDate) {
      query += ` AND DATE(m.caller_created_at) >= $${params.length + 1}`;
      countQuery += ` AND DATE(m.caller_created_at) >= $${countParams.length + 1}`;
      params.push(fromDate);
      countParams.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND DATE(m.caller_created_at) <= $${params.length + 1}`;
      countQuery += ` AND DATE(m.caller_created_at) <= $${countParams.length + 1}`;
      params.push(toDate);
      countParams.push(toDate);
    }
    
    query += ` ORDER BY m.caller_created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, skip);
    
    const data = await this.mobileNumberRepository.query(query, params);
    const countResult = await this.mobileNumberRepository.query(countQuery, countParams);
    
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

  async getCallHistoryByUser(userId: number, page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `SELECT m.*, u.first_name, u.last_name, u.username
                 FROM mobile_numbers m
                 LEFT JOIN users u ON m.caller_by = u.id
                 WHERE m.caller_by = $1 AND m.caller_created_at IS NOT NULL`;
    
    let countQuery = `SELECT COUNT(*) as total FROM mobile_numbers WHERE caller_by = $1 AND caller_created_at IS NOT NULL`;
    let params: (number | string)[] = [userId];
    let countParams: (number | string)[] = [userId];
    
    if (locationId) {
      query += ` AND m.location_id = $${params.length + 1}`;
      countQuery += ` AND location_id = $${countParams.length + 1}`;
      params.push(locationId);
      countParams.push(locationId);
    }
    
    if (fromDate) {
      query += ` AND DATE(m.caller_created_at) >= $${params.length + 1}`;
      countQuery += ` AND DATE(caller_created_at) >= $${countParams.length + 1}`;
      params.push(fromDate);
      countParams.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND DATE(m.caller_created_at) <= $${params.length + 1}`;
      countQuery += ` AND DATE(caller_created_at) <= $${countParams.length + 1}`;
      params.push(toDate);
      countParams.push(toDate);
    }
    
    query += ` ORDER BY m.caller_created_at DESC, m.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, skip);
    
    const data = await this.mobileNumberRepository.query(query, params);
    const countResult = await this.mobileNumberRepository.query(countQuery, countParams);
    
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
}