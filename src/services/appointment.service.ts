import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private dataSource: DataSource,
  ) {}

  async getAppointments(filters: {
    fromDate?: string;
    toDate?: string;
    status?: string;
    search?: string;
    page: number;
    limit: number;
    locationId?: number;
    doctorId?: number;
  }) {
    try {
      const { locationId } = filters;

      
      const appointments = await this.dataSource.query(`
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.appointment_type,
          a.appointment_type_id,
          a.status,
          a.notes,
          a.created_at,
          a.created_by,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          p.mobile as patient_phone,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name,
          c.first_name as creator_first_name,
          c.last_name as creator_last_name,
          at.name as appointment_type_name,
          at.code as appointment_type_code,
          ch.next_call_date
        FROM appointments a
        LEFT JOIN patients p ON p.id = a.patient_id
        LEFT JOIN users d ON d.id = a.doctor_id
        LEFT JOIN users c ON c.id = a.created_by
        LEFT JOIN appointment_types at ON at.id = a.appointment_type_id
        LEFT JOIN (
          SELECT DISTINCT ON (patient_id) 
            patient_id, 
            next_call_date
          FROM call_history 
          ORDER BY patient_id, next_call_date DESC
        ) ch ON ch.patient_id::text = a.patient_id::text
        WHERE a.location_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
        LIMIT $2 OFFSET $3
      `, [locationId, filters.limit, (filters.page - 1) * filters.limit]);
      
      // Get total count
      const countResult = await this.dataSource.query(`
        SELECT COUNT(*) as total
        FROM appointments a
        WHERE a.location_id = $1
      `, [locationId]);
      
      const total = parseInt(countResult[0].total);
      const totalPages = Math.ceil(total / filters.limit);
      

      
      return {
        data: appointments.map(appointment => ({
          id: appointment.appointment_id,
          patientId: appointment.patient_id,
          patientName: `${appointment.patient_first_name || ''} ${appointment.patient_last_name || ''}`.trim() || `Patient #${appointment.patient_id}`,
          patientPhone: appointment.patient_phone || 'N/A',
          createdBy: `${appointment.creator_first_name || ''} ${appointment.creator_last_name || ''}`.trim() || 'System',
          doctorId: appointment.doctor_id,
          doctorName: `${appointment.doctor_first_name || ''} ${appointment.doctor_last_name || ''}`.trim() || `Doctor #${appointment.doctor_id}`,
          appointmentDate: appointment.appointment_date,
          appointmentTime: appointment.appointment_time,
          type: appointment.appointment_type_code || appointment.appointment_type || 'consultation',
          typeName: appointment.appointment_type_name || 'Consultation',
          status: appointment.status || 'pending',
          notes: appointment.notes,
          createdAt: appointment.created_at,
          nextCallDate: appointment.next_call_date
        })),
        total: total,
        page: filters.page,
        limit: filters.limit,
        totalPages: totalPages,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in getAppointments:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }
  }

  async getPatientAppointments(patientId: number, locationId?: number) {
    const queryBuilder = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.patient_id = :patientId', { patientId });
    
    if (locationId) {
      queryBuilder.andWhere('appointment.location_id = :locationId', { locationId });
    }
    
    const appointments = await queryBuilder.getMany();

    return appointments.map(appointment => ({
      id: appointment.id,
      appointmentId: appointment.appointment_id,
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      appointmentType: appointment.appointment_type,
      doctorName: `Doctor #${appointment.doctor_id}`,
      notes: appointment.notes,
      createdAt: appointment.created_at
    }));
  }

  async createAppointment(appointmentData: any, locationId: number) {
    // Get appointment type ID from code
    const appointmentTypeResult = await this.dataSource.query(
      'SELECT id FROM appointment_types WHERE code = $1 LIMIT 1',
      [appointmentData.appointmentType || 'consultation']
    );
    
    const appointmentTypeId = appointmentTypeResult.length > 0 ? appointmentTypeResult[0].id : 1;

    const appointment = this.appointmentRepository.create({
      appointment_id: `APT${Date.now()}`,
      patient_id: appointmentData.patientId,
      doctor_id: appointmentData.doctorId,
      appointment_date: appointmentData.appointmentDate,
      appointment_time: appointmentData.appointmentTime,
      appointment_type: appointmentData.appointmentType || 'consultation',
      appointment_type_id: appointmentTypeId,
      notes: appointmentData.notes,
      location_id: locationId,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    return {
      message: 'Appointment created successfully',
      appointment: {
        id: savedAppointment.id,
        appointmentId: savedAppointment.appointment_id
      }
    };
  }

  async updateNextCallDate(patientId: number, nextCallDate: string, userId: number, locationId: number) {
    try {
      // Insert or update call history record
      await this.dataSource.query(`
        INSERT INTO call_history (patient_id, next_call_date, created_by, location_id, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `, [patientId, nextCallDate, userId, locationId]);

      return {
        message: 'Next call date updated successfully',
        patientId,
        nextCallDate
      };
    } catch (error) {
      console.error('Error updating next call date:', error);
      throw new Error('Failed to update next call date');
    }
  }

  async getAppointmentById(appointmentId: string) {
    try {
      const appointment = await this.dataSource.query(`
        SELECT 
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.appointment_type,
          a.status,
          a.notes,
          a.created_at,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          d.first_name as doctor_first_name,
          d.last_name as doctor_last_name
        FROM appointments a
        LEFT JOIN patients p ON p.id = a.patient_id
        LEFT JOIN users d ON d.id = a.doctor_id
        WHERE a.appointment_id = $1
      `, [appointmentId]);

      if (appointment.length === 0) {
        throw new Error('Appointment not found');
      }

      const apt = appointment[0];
      return {
        id: apt.appointment_id,
        patientId: apt.patient_id,
        doctorId: apt.doctor_id,
        appointmentDate: apt.appointment_date,
        appointmentTime: apt.appointment_time,
        type: apt.appointment_type,
        status: apt.status,
        notes: apt.notes,
        patientName: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim(),
        doctorName: `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim()
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw new Error('Failed to fetch appointment');
    }
  }

  async updateAppointment(appointmentId: string, updateData: any) {
    try {
      // Get appointment type ID from code
      const appointmentTypeResult = await this.dataSource.query(
        'SELECT id FROM appointment_types WHERE code = $1 LIMIT 1',
        [updateData.appointmentType || 'consultation']
      );
      
      const appointmentTypeId = appointmentTypeResult.length > 0 ? appointmentTypeResult[0].id : 1;

      const result = await this.dataSource.query(`
        UPDATE appointments 
        SET 
          doctor_id = $1,
          appointment_date = $2,
          appointment_time = $3,
          appointment_type = $4,
          appointment_type_id = $5,
          status = $6,
          notes = $7
        WHERE appointment_id = $8
      `, [
        updateData.doctorId,
        updateData.appointmentDate,
        updateData.appointmentTime,
        updateData.appointmentType,
        appointmentTypeId,
        updateData.status,
        updateData.notes,
        appointmentId
      ]);

      if (result.rowCount === 0) {
        // Try to find if appointment exists
        const existing = await this.dataSource.query('SELECT * FROM appointments WHERE appointment_id = $1 OR id = $1', [appointmentId]);
        if (existing.length === 0) {
          throw new Error('Appointment not found');
        }
        throw new Error('Update failed - no rows affected');
      }
      
      return {
        message: 'Appointment updated successfully',
        appointmentId
      };
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw new Error('Failed to update appointment');
    }
  }

  async getDoctorAppointmentsWithUserDetails(doctorId: number, page: number = 1, limit: number = 50, fromDate?: string, toDate?: string) {
    try {
      let query = `
        SELECT 
          a.id,
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_date,
          a.appointment_time,
          a.appointment_type,
          a.status,
          a.notes,
          a.created_at,
          p.first_name as patient_first_name,
          p.last_name as patient_last_name,
          p.mobile as patient_phone,
          u.first_name as doctor_first_name,
          u.last_name as doctor_last_name,
          u.email as doctor_email,
          u.phone as doctor_phone
        FROM appointments a
        LEFT JOIN patients p ON p.id = a.patient_id
        LEFT JOIN users u ON u.id = a.doctor_id
        WHERE a.doctor_id = $1`;

      const params: any[] = [doctorId];
      let paramIndex = 2;

      if (fromDate) {
        query += ` AND a.appointment_date >= $${paramIndex}`;
        params.push(fromDate);
        paramIndex++;
      }

      if (toDate) {
        query += ` AND a.appointment_date <= $${paramIndex}`;
        params.push(toDate);
        paramIndex++;
      }

      query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, (page - 1) * limit);

      const appointments = await this.dataSource.query(query, params);

      let countQuery = `SELECT COUNT(*) as total FROM appointments a WHERE a.doctor_id = $1`;
      const countParams: any[] = [doctorId];
      let countParamIndex = 2;

      if (fromDate) {
        countQuery += ` AND a.appointment_date >= $${countParamIndex}`;
        countParams.push(fromDate);
        countParamIndex++;
      }

      if (toDate) {
        countQuery += ` AND a.appointment_date <= $${countParamIndex}`;
        countParams.push(toDate);
      }

      const countResult = await this.dataSource.query(countQuery, countParams);

      const total = parseInt(countResult[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        data: appointments.map(apt => ({
          id: apt.appointment_id,
          patientId: apt.patient_id,
          patientName: `${apt.patient_first_name || ''} ${apt.patient_last_name || ''}`.trim() || `Patient #${apt.patient_id}`,
          patientPhone: apt.patient_phone || 'N/A',
          doctorId: apt.doctor_id,
          doctorName: `${apt.doctor_first_name || ''} ${apt.doctor_last_name || ''}`.trim(),
          doctorEmail: apt.doctor_email,
          doctorPhone: apt.doctor_phone,
          appointmentDate: apt.appointment_date,
          appointmentTime: apt.appointment_time,
          type: apt.appointment_type,
          status: apt.status || 'scheduled',
          notes: apt.notes,
          createdAt: apt.created_at
        })),
        total,
        page,
        limit,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }
  }
}
