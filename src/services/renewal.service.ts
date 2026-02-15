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

  
  async getRenewalPatients(locationId: number, fromDate?: string, toDate?: string) {
    let query = `
      SELECT 
        pe.patient_id as "patientId",
        p.first_name as "firstName",
        p.last_name as "lastName",
        p.mobile as "mobileNumber",
        pe.next_renewal_date_pro as "nextRenewalDatePro",
        pe.treatment_plan_months_pro as "treatmentPlanMonthsPro"
      FROM patient_examination pe
      LEFT JOIN patients p ON pe.patient_id::integer = p.id
      WHERE pe.next_renewal_date_pro IS NOT NULL
        AND p.location_id = $1`;
    
    const params: (number | string)[] = [locationId];
    
    if (fromDate) {
      query += ` AND DATE(pe.next_renewal_date_pro) >= $${params.length + 1}`;
      params.push(fromDate);
    }
    
    if (toDate) {
      query += ` AND DATE(pe.next_renewal_date_pro) <= $${params.length + 1}`;
      params.push(toDate);
    }
    
    query += ` ORDER BY pe.next_renewal_date_pro ASC`;
    
    return this.patientExaminationRepository.query(query, params);
  }
}