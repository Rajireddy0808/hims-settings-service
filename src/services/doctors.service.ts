import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorTimeslot } from '../entities/doctor-timeslot.entity';
import { User } from '../entities/user.entity';
import { DoctorConsultationFee } from '../entities/doctor-consultation-fee.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorTimeslot)
    private timeslotRepository: Repository<DoctorTimeslot>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(DoctorConsultationFee)
    private consultationFeeRepository: Repository<DoctorConsultationFee>,
    private configService: ConfigService
  ) {}

  async getDoctors(locationId?: number) {
    try {

      
      let query;
      let params = [];
      
      if (locationId) {
        // Filter users by location using user_location_permissions table
        query = `
          SELECT DISTINCT u.*
          FROM users u
          INNER JOIN user_location_permissions ulp ON u.id = ulp.user_id
          WHERE ulp.location_id = $1
        `;
        params = [locationId];
      } else {
        // Get all users
        query = 'SELECT * FROM users';
      }
      
      const users = await this.userRepository.query(query, params);
      

      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error details:', error.message);
      return [];
    }
  }

  async createBulkTimeslots(data: { userId: number; date: string; fromTime: string; toTime: string; duration: number; locationId: number }) {
    try {

      
      const timeSlots = [];
      const [startHour, startMin] = data.fromTime.split(':').map(Number);
      const [endHour, endMin] = data.toTime.split(':').map(Number);
      
      let startMinutes = startHour * 60 + startMin;
      let endMinutes = endHour * 60 + endMin;
      
      if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60;
      }
      
      for (let minutes = startMinutes; minutes < endMinutes; minutes += data.duration) {
        const actualMinutes = minutes % (24 * 60);
        const hours = Math.floor(actualMinutes / 60);
        const mins = actualMinutes % 60;
        const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        timeSlots.push(timeStr);
      }
      
      const results = [];
      for (const time of timeSlots) {
        const query = `
          INSERT INTO doctor_timeslots (user_id, location_id, date, time, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING *
        `;
        
        const result = await this.timeslotRepository.query(query, [
          data.userId,
          data.locationId,
          data.date,
          time,
          1
        ]);
        
        results.push(result[0]);
      }


      return { success: true, count: results.length, data: results };
    } catch (error) {
      console.error('Error inserting timeslots:', error);
      return { success: false, error: error.message };
    }
  }

  async getDoctorTimeslots(locationId?: number, userId?: number, fromDate?: string, toDate?: string) {
    try {

      
      let whereConditions = ['dt.status = \'1\''];
      const params = [];
      let paramIndex = 1;
      
      if (locationId) {
        whereConditions.push(`dt.location_id = $${paramIndex}`);
        params.push(locationId);
        paramIndex++;
      }
      
      if (userId) {
        whereConditions.push(`dt.user_id = $${paramIndex}`);
        params.push(userId);
        paramIndex++;
      }
      
      if (fromDate) {
        whereConditions.push(`dt.date >= $${paramIndex}`);
        params.push(fromDate);
        paramIndex++;
      }
      
      if (toDate) {
        whereConditions.push(`dt.date <= $${paramIndex}`);
        params.push(toDate);
        paramIndex++;
      }
      
      const query = `
        SELECT 
          dt.id,
          dt.user_id as userId,
          TO_CHAR(dt.date, 'YYYY-MM-DD') as date,
          dt.time,
          dt.status,
          u.first_name as firstName,
          u.last_name as lastName,
          u.email,
          d.name as departmentName,
          l.name as locationName
        FROM doctor_timeslots dt
        LEFT JOIN users u ON dt.user_id = u.id
        LEFT JOIN user_location_permissions ulp ON dt.user_id = ulp.user_id AND dt.location_id = ulp.location_id
        LEFT JOIN departments d ON ulp.department_id = d.id
        LEFT JOIN locations l ON dt.location_id = l.id
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY dt.date, dt.time
      `;
      
      const timeslots = await this.timeslotRepository.query(query, params);
      

      return timeslots;
    } catch (error) {
      console.error('Error fetching doctor timeslots:', error);
      return [];
    }
  }

  async getAllDoctorTimeslots(locationId?: number) {
    try {

      
      const query = `
        SELECT 
          dt.id,
          dt.user_id as userId,
          TO_CHAR(dt.date, 'YYYY-MM-DD') as date,
          dt.time,
          dt.status,
          u.first_name as firstName,
          u.last_name as lastName,
          u.email,
          d.name as departmentName,
          l.name as locationName
        FROM doctor_timeslots dt
        LEFT JOIN users u ON dt.user_id = u.id
        LEFT JOIN user_location_permissions ulp ON dt.user_id = ulp.user_id AND dt.location_id = ulp.location_id
        LEFT JOIN departments d ON ulp.department_id = d.id
        LEFT JOIN locations l ON dt.location_id = l.id
        ${locationId ? 'WHERE dt.location_id = $1' : ''}
        ORDER BY dt.date, dt.time
      `;
      
      const params = locationId ? [locationId] : [];
      const timeslots = await this.timeslotRepository.query(query, params);
      

      return timeslots;
    } catch (error) {
      console.error('Error fetching ALL doctor timeslots:', error);
      return [];
    }
  }

  async updateTimeslotStatus(id: number, isActive: boolean) {
    try {
      const status = isActive ? 1 : 0;
      const query = `
        UPDATE doctor_timeslots 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await this.timeslotRepository.query(query, [status, id]);
      
      if (result.length === 0) {
        throw new Error('Timeslot not found');
      }
      
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error updating timeslot status:', error);
      throw error;
    }
  }

  async getConsultationFees(locationId?: number) {
    try {

      
      const query = `
        SELECT 
          dcf.id,
          dcf.location_id as locationId,
          dcf.user_id as userId,
          dcf.department_id as departmentId,
          dcf.fee as cashFee,
          dcf.status,
          u.first_name as firstName,
          u.last_name as lastName,
          d.name as departmentName
        FROM doctor_consultation_fee dcf
        LEFT JOIN users u ON dcf.user_id = u.id
        LEFT JOIN departments d ON dcf.department_id = d.id
        WHERE dcf.location_id = $1
        ORDER BY dcf.id DESC
      `;
      
      const fees = await this.consultationFeeRepository.query(query, [locationId || 1]);

      
      return fees;
    } catch (error) {
      console.error('Error fetching consultation fees:', error);
      return [];
    }
  }

  async createConsultationFee(data: { userId: number; cashFee: number; locationId: number; departmentId: number }) {
    try {
      const query = `
        INSERT INTO doctor_consultation_fee (location_id, user_id, department_id, fee, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *
      `;
      
      const result = await this.consultationFeeRepository.query(query, [
        data.locationId,
        data.userId,
        data.departmentId,
        data.cashFee,
        1
      ]);
      
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error creating consultation fee:', error);
      return { success: false, error: error.message };
    }
  }

  async updateConsultationFee(id: number, data: { userId: number; cashFee: number; locationId?: number; departmentId?: number }) {
    try {
      const query = `
        UPDATE doctor_consultation_fee 
        SET fee = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *
      `;
      
      const result = await this.consultationFeeRepository.query(query, [data.cashFee, id]);
      
      if (result.length === 0) {
        throw new Error('Consultation fee not found');
      }
      
      return { success: true, data: result[0] };
    } catch (error) {
      console.error('Error updating consultation fee:', error);
      throw error;
    }
  }

  async deleteConsultationFee(id: number) {
    try {
      const query = `DELETE FROM doctor_consultation_fee WHERE id = $1`;
      const result = await this.consultationFeeRepository.query(query, [id]);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting consultation fee:', error);
      throw error;
    }
  }
}
