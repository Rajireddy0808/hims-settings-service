import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientListService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) { }

  async getAllPatients(locationId: number, fromDate?: string, toDate?: string, page: number = 1, limit: number = 10, search?: string) {
    console.log('Filters:', { fromDate, toDate, locationId, search }); // Debug log

    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .where('patient.location_id = :locationId', { locationId });

    if (search) {
      queryBuilder.andWhere(
        '(patient.patient_id LIKE :search OR patient.first_name ILIKE :search OR patient.last_name ILIKE :search OR patient.mobile LIKE :search)',
        { search: `%${search}%` }
      );
    }

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

  async getRefPatients(locationId: number, page: number = 1, limit: number = 10) {
    const [data, total] = await this.patientRepository.createQueryBuilder('patient')
      .where('patient.location_id = :locationId', { locationId })
      .andWhere('patient.ref_patient_id IS NOT NULL')
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

  async getEmployeeRefPatients(locationId: number, page: number = 1, limit: number = 10) {
    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('users', 'referrer', 'patient.employee_ref_id = referrer.id')
      .where('patient.location_id = :locationId', { locationId })
      .andWhere('patient.employee_ref_id IS NOT NULL')
      .select([
        'patient.id as id',
        'patient.patient_id as patient_id',
        'patient.first_name as first_name',
        'patient.last_name as last_name',
        'patient.mobile as mobile',
        'patient.gender as gender',
        'patient.employee_ref_id as employee_ref_id',
        'patient.created_at as created_at',
        'patient.salutation as salutation',
        'referrer.first_name as referrer_first_name',
        'referrer.last_name as referrer_last_name'
      ])
      .orderBy('patient.created_at', 'DESC');

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}
