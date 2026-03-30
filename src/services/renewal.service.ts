import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientExamination } from '../entities/patient-examination.entity';

@Injectable()
export class RenewalService {
  constructor(
    @InjectRepository(PatientExamination)
    private patientExaminationRepository: Repository<PatientExamination>,
  ) {}

  
  async getRenewalPatients(locationId: number, fromDate?: string, toDate?: string, search?: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    let whereClause = `WHERE pe.next_renewal_date_pro IS NOT NULL AND pe.location_id = $1`;
    const params: (number | string)[] = [locationId];

    if (search) {
      whereClause += ` AND (
        p.first_name ILIKE $${params.length + 1} OR 
        p.last_name ILIKE $${params.length + 1} OR 
        p.mobile ILIKE $${params.length + 1} OR
        p.patient_id ILIKE $${params.length + 1}
      )`;
      params.push(`%${search}%`);
    } else {
      if (fromDate) {
        whereClause += ` AND DATE(pe.next_renewal_date_pro) >= $${params.length + 1}`;
        params.push(fromDate);
      }
      
      if (toDate) {
        whereClause += ` AND DATE(pe.next_renewal_date_pro) <= $${params.length + 1}`;
        params.push(toDate);
      }
    }

    // Get total count
    const countResult = await this.patientExaminationRepository.query(
      `SELECT COUNT(*) as total FROM patient_examination pe LEFT JOIN patients p ON pe.patient_id::integer = p.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].total);

    // Get paginated data
    const query = `
      SELECT 
        pe.patient_id as "patientId",
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.mobile as "mobileNumber",
        p.patient_id as "patientIdStr",
        pe.next_renewal_date_pro as "nextRenewalDatePro",
        pe.treatment_plan_months_pro as "treatmentPlanMonthsPro"
      FROM patient_examination pe
      LEFT JOIN patients p ON pe.patient_id::integer = p.id
      ${whereClause}
      ORDER BY pe.next_renewal_date_pro ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const data = await this.patientExaminationRepository.query(query, [...params, limit, offset]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}