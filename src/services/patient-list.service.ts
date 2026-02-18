import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientListService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async getAllPatients(locationId: number, fromDate?: string, toDate?: string, page: number = 1, limit: number = 10) {
    console.log('Date filters:', { fromDate, toDate, locationId }); // Debug log
    
    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .where('patient.location_id = :locationId', { locationId });
    
    if (fromDate) {
      console.log('Adding fromDate filter:', fromDate);
      queryBuilder.andWhere('DATE(patient.created_at) >= :fromDate', { fromDate });
    }
    
    if (toDate) {
      console.log('Adding toDate filter:', toDate);
      queryBuilder.andWhere('DATE(patient.created_at) <= :toDate', { toDate });
    }
    
    const [data, total] = await queryBuilder
      .orderBy('patient.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getPatientById(patientId: string, locationId: number, userId?: string) {
    // Validate user access - only allow access to patients in user's location
    if (!userId) {
      throw new Error('User authentication required');
    }
    
    // Try to find by numeric ID first
    const numericId = parseInt(patientId);
    if (!isNaN(numericId)) {
      const patient = await this.patientRepository.findOne({
        where: { id: numericId, location_id: locationId }
      });
      if (patient) return patient;
    }
    
    // If not found or not numeric, try to find by patient_id
    return this.patientRepository.findOne({
      where: { patient_id: patientId, location_id: locationId }
    });
  }

  async getPatientsBySource(locationId: number, patientSourceId: number, fromDate?: string, toDate?: string) {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .where('patient.location_id = :locationId', { locationId })
      .andWhere('patient.patient_source_id = :patientSourceId', { patientSourceId });
    
    if (fromDate) {
      queryBuilder.andWhere('DATE(patient.created_at) >= :fromDate', { fromDate });
    }
    
    if (toDate) {
      queryBuilder.andWhere('DATE(patient.created_at) <= :toDate', { toDate });
    }
    
    return queryBuilder.orderBy('patient.created_at', 'DESC').getMany();
  }
}
