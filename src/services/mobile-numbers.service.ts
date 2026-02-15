import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileNumber } from '../entities/mobile-number.entity';


@Injectable()
export class MobileNumbersService {
  constructor(
    @InjectRepository(MobileNumber)
    private mobileNumberRepository: Repository<MobileNumber>,
  ) {}

  async getMobileNumbersByUserId(userId: number, page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `SELECT m.* FROM mobile_numbers m WHERE m.user_id = $1`;
    let countQuery = `SELECT COUNT(*) as total FROM mobile_numbers WHERE user_id = $1`;
    let params: (number | string)[] = [userId];
    let countParams: (number | string)[] = [userId];
    
    if (locationId) {
      query += ` AND m.location_id = $${params.length + 1}`;
      countQuery += ` AND location_id = $${countParams.length + 1}`;
      params.push(locationId);
      countParams.push(locationId);
    }
    
    // If no date filter is applied, show records with next_call_date IS NULL or updated_at is today
    if (!fromDate && !toDate) {
      const today = new Date().toISOString().split('T')[0];
      query += ` AND (m.next_call_date IS NULL OR DATE(m.updated_at) = '${today}')`;
      countQuery += ` AND (next_call_date IS NULL OR DATE(updated_at) = '${today}')`;
    } else {
      // Apply date filters when provided
      if (fromDate) {
        query += ` AND DATE(m.updated_at) >= $${params.length + 1}`;
        countQuery += ` AND DATE(updated_at) >= $${countParams.length + 1}`;
        params.push(fromDate);
        countParams.push(fromDate);
      }
      
      if (toDate) {
        query += ` AND DATE(m.updated_at) <= $${params.length + 1}`;
        countQuery += ` AND DATE(updated_at) <= $${countParams.length + 1}`;
        params.push(toDate);
        countParams.push(toDate);
      }
    }
    
    query += ` ORDER BY m.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

  async getMyNextCallDateNumbers(userId: number, page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `
      SELECT 
        nc.id,
        m.mobile,
        nc.next_call_date,
        nc.disposition,
        nc.patient_feeling,
        nc.notes,
        nc.caller_by,
        nc.caller_created_at,
        nc.caller_updated_at
      FROM mobile_number_next_call_ob nc
      INNER JOIN mobile_numbers m ON m.id = nc.mobile_number_id
      WHERE m.user_id = $1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM mobile_number_next_call_ob nc
      INNER JOIN mobile_numbers m ON m.id = nc.mobile_number_id
      WHERE m.user_id = $1
    `;
    
    let params: (number | string)[] = [userId];
    let countParams: (number | string)[] = [userId];
    let paramIndex = 2;
    let countParamIndex = 2;
    
    if (locationId) {
      query += ` AND m.location_id = $${paramIndex}`;
      countQuery += ` AND m.location_id = $${countParamIndex}`;
      params.push(locationId);
      countParams.push(locationId);
      paramIndex++;
      countParamIndex++;
    }
    
    if (fromDate) {
      query += ` AND DATE(nc.next_call_date) >= $${paramIndex}`;
      countQuery += ` AND DATE(nc.next_call_date) >= $${countParamIndex}`;
      params.push(fromDate);
      countParams.push(fromDate);
      paramIndex++;
      countParamIndex++;
    }
    
    if (toDate) {
      query += ` AND DATE(nc.next_call_date) <= $${paramIndex}`;
      countQuery += ` AND DATE(nc.next_call_date) <= $${countParamIndex}`;
      params.push(toDate);
      countParams.push(toDate);
      paramIndex++;
      countParamIndex++;
    }
    
    query += ` ORDER BY nc.next_call_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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

  async getNextCallDateNumbers(userId: number, page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `SELECT m.* FROM mobile_numbers m WHERE m.next_call_date IS NOT NULL`;
    let countQuery = `SELECT COUNT(*) as total FROM mobile_numbers WHERE next_call_date IS NOT NULL`;
    let params: (number | string)[] = [];
    let countParams: (number | string)[] = [];
    
    if (locationId) {
      query += ` AND m.location_id = $${params.length + 1}`;
      countQuery += ` AND location_id = $${countParams.length + 1}`;
      params.push(locationId);
      countParams.push(locationId);
    }
    
    if (fromDate) {
      query += ` AND DATE(m.next_call_date) >= $${params.length + 1}`;
      countQuery += ` AND DATE(next_call_date) >= $${countParams.length + 1}`;
      params.push(fromDate);
      countParams.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND DATE(m.next_call_date) <= $${params.length + 1}`;
      countQuery += ` AND DATE(next_call_date) <= $${countParams.length + 1}`;
      params.push(toDate);
      countParams.push(toDate);
    }
    
    query += ` ORDER BY m.next_call_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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

  // New method for today's calls
  async getTodayCallsByUserId(userId: number, page: number = 1, limit: number = 10, locationId?: number) {
    const skip = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0];
    
    let query = `SELECT m.* FROM mobile_numbers m WHERE m.user_id = $1 AND m.caller_created_at IS NOT NULL AND DATE(m.caller_created_at) = '${today}'`;
    let countQuery = `SELECT COUNT(*) as total FROM mobile_numbers WHERE user_id = $1 AND caller_created_at IS NOT NULL AND DATE(caller_created_at) = '${today}'`;
    let params: (number | string)[] = [userId];
    let countParams: (number | string)[] = [userId];
    
    if (locationId) {
      query += ` AND m.location_id = $${params.length + 1}`;
      countQuery += ` AND location_id = $${countParams.length + 1}`;
      params.push(locationId);
      countParams.push(locationId);
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

  async getAllMobileNumbers(userId: number) {
    return this.mobileNumberRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async addMobileNumber(mobile: string, userId: number, locationId: number) {
    const mobileNumber = this.mobileNumberRepository.create({
      mobile,
      user_id: userId,
      location_id: locationId,
      created_by: userId
    });

    return this.mobileNumberRepository.save(mobileNumber);
  }

  async bulkUpload(file: any, userId: number, locationId: number) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    try {
      // Read CSV file
      const fileContent = file.buffer.toString('utf8');
      const lines = fileContent.split('\n');
      const mobileNumbers = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const mobile = line.split(',')[0].trim();
          if (mobile && mobile.length >= 10) {
            mobileNumbers.push({
              mobile: mobile,
              user_id: userId,
              location_id: locationId,
              created_by: userId
            });
          }
        }
      }

      if (mobileNumbers.length === 0) {
        throw new Error('No valid mobile numbers found in file');
      }

      // Save to database
      const savedNumbers = await this.mobileNumberRepository.save(mobileNumbers);

      return {
        success: true,
        message: `Successfully uploaded ${savedNumbers.length} mobile numbers`,
        count: savedNumbers.length
      };
    } catch (error) {
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  async getMyOBCallHistory(userId: number, page: number = 1, limit: number = 10, locationId?: number, fromDate?: string, toDate?: string) {
    const skip = (page - 1) * limit;
    
    let query = `
      SELECT 
        nc.id,
        m.mobile,
        nc.disposition,
        nc.notes,
        nc.caller_created_at as created_at,
        nc.caller_by,
        u.first_name || ' ' || u.last_name as caller_name,
        p.first_name || ' ' || p.last_name as patient_name
      FROM mobile_number_next_call_ob nc
      INNER JOIN mobile_numbers m ON m.id = nc.mobile_number_id
      LEFT JOIN users u ON u.id = nc.caller_by
      LEFT JOIN patients p ON p.mobile = m.mobile
      WHERE nc.caller_by = $1
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM mobile_number_next_call_ob 
      WHERE caller_by = $1
    `;
    
    let params: any[] = [userId];
    let countParams: any[] = [userId];
    let paramIndex = 2;
    let countParamIndex = 2;
    
    if (locationId) {
      query += ` AND m.location_id = $${paramIndex}`;
      countQuery += ` AND EXISTS (SELECT 1 FROM mobile_numbers WHERE id = mobile_number_id AND location_id = $${countParamIndex})`;
      params.push(locationId);
      countParams.push(locationId);
      paramIndex++;
      countParamIndex++;
    }
    
    if (fromDate) {
      query += ` AND DATE(nc.caller_created_at) >= $${paramIndex}`;
      countQuery += ` AND DATE(caller_created_at) >= $${countParamIndex}`;
      params.push(fromDate);
      countParams.push(fromDate);
      paramIndex++;
      countParamIndex++;
    }
    
    if (toDate) {
      query += ` AND DATE(nc.caller_created_at) <= $${paramIndex}`;
      countQuery += ` AND DATE(caller_created_at) <= $${countParamIndex}`;
      params.push(toDate);
      countParams.push(toDate);
      paramIndex++;
      countParamIndex++;
    }
    
    query += ` ORDER BY nc.caller_created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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