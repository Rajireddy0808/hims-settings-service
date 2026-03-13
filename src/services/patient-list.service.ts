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

  async getAllPatients(
    locationId?: number, 
    fromDate?: string, 
    toDate?: string, 
    page: number = 1, 
    limit: number = 10, 
    search?: string,
    sortField: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' | 'asc' | 'desc' = 'DESC'
  ) {
    console.log('Filters:', { fromDate, toDate, locationId, search, sortField, sortOrder }); // Debug log

    const queryBuilder = this.patientRepository.createQueryBuilder('patient')
      .leftJoin(qb => {
        return qb
          .select('pe.patient_id', 'patient_id')
          .addSelect('pe.next_renewal_date_pro', 'next_renewal_date_pro')
          .addSelect('pe.due_amount', 'due_amount')
          .from('patient_examination', 'pe')
          .where('pe.id IN (SELECT MAX(id) FROM patient_examination GROUP BY patient_id)');
      }, 'latest_exam', 'latest_exam.patient_id = patient.id')
      .leftJoin('locations', 'loc', 'patient.location_id = loc.id')
      .select([
        'patient.id',
        'patient.patient_id',
        'patient.salutation',
        'patient.first_name',
        'patient.middle_name',
        'patient.last_name',
        'patient.gender',
        'patient.date_of_birth',
        'patient.mobile',
        'patient.email',
        'patient.created_at',
        'patient.updated_at',
        'patient.status',
        'latest_exam.next_renewal_date_pro as next_renewal_date_pro',
        'latest_exam.due_amount as due_amount',
        'loc.name as location_name'
      ]);

    // Only filter by location if locationId is provided and not 0
    if (locationId && locationId !== 0) {
      queryBuilder.where('patient.location_id = :locationId', { locationId });
    }

    if (search) {
      const searchCondition = '(patient.patient_id LIKE :search OR patient.first_name ILIKE :search OR patient.last_name ILIKE :search OR (patient.first_name || \' \' || patient.last_name) ILIKE :search OR patient.mobile LIKE :search)';
      if (locationId && locationId !== 0) {
        queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
      } else {
        queryBuilder.where(searchCondition, { search: `%${search}%` });
      }
    }

    if (fromDate) {
      if (locationId && locationId !== 0 || search) {
        queryBuilder.andWhere('DATE(patient.created_at) >= :fromDate', { fromDate });
      } else {
        queryBuilder.where('DATE(patient.created_at) >= :fromDate', { fromDate });
      }
    }

    if (toDate) {
      if (locationId && locationId !== 0 || search || fromDate) {
        queryBuilder.andWhere('DATE(patient.created_at) <= :toDate', { toDate });
      } else {
        queryBuilder.where('DATE(patient.created_at) <= :toDate', { toDate });
      }
    }

    // Mapping frontend fields to DB columns for sorting
    let orderByField = 'patient.created_at';
    const sortFieldMap: Record<string, string> = {
      'patientId': 'patient.patient_id',
      'name': 'patient.first_name',
      'mobile': 'patient.mobile',
      'nextRenewalDate': 'latest_exam.next_renewal_date_pro',
      'dueAmount': 'latest_exam.due_amount',
      'age': 'patient.date_of_birth',
      'gender': 'patient.gender',
      'status': 'patient.status',
      'createdAt': 'patient.created_at'
    };

    if (sortField && sortFieldMap[sortField]) {
      orderByField = sortFieldMap[sortField];
    }

    const validatedSortOrder = (sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const total = await queryBuilder.getCount();
    const data = await queryBuilder
      .orderBy(orderByField, validatedSortOrder)
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

  async getPatientById(patientId: string, locationId: number, userId?: string) {
    // Validate user authentication
    if (!userId) {
      throw new Error('User authentication required');
    }

    // Try to find by numeric ID first
    const numericId = parseInt(patientId);
    if (!isNaN(numericId)) {
      const patient = await this.patientRepository.findOne({
        where: { id: numericId }
      });
      if (patient) return patient;
    }

    // If not found or not numeric, try to find by patient_id
    return this.patientRepository.findOne({
      where: { patient_id: patientId }
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

  async getMonthlyPatientStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const stats = await this.patientRepository.createQueryBuilder('patient')
        .select([
          `COUNT(CASE WHEN DATE(patient.created_at) = '${today}' THEN 1 END) as patients_today`,
          `COUNT(CASE WHEN patient.created_at >= :startOfMonth AND patient.created_at < :endOfMonth THEN 1 END) as patients_month`
        ])
        .setParameters({ startOfMonth, endOfMonth })
        .getRawOne();

      return {
        today: parseInt(stats.patients_today || '0'),
        month: parseInt(stats.patients_month || '0')
      };
    } catch (error) {
      console.error('Error fetching monthly patient stats:', error);
      return { today: 0, month: 0 };
    }
  }

  async getYearlyPatientFlow() {
    try {
      const currentYear = new Date().getFullYear();
      
      const stats = await this.patientRepository.createQueryBuilder('patient')
        .select("EXTRACT(MONTH FROM patient.created_at)", "month")
        .addSelect("COUNT(*)", "count")
        .where("EXTRACT(YEAR FROM patient.created_at) = :currentYear", { currentYear })
        .groupBy("month")
        .orderBy("month", "ASC")
        .getRawMany();

      // Initialize all 12 months with 0
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0
      }));

      // Map db results to the month array
      stats.forEach(item => {
        const monthIndex = parseInt(item.month) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyData[monthIndex].count = parseInt(item.count);
        }
      });

      return monthlyData;
    } catch (error) {
      console.error('Error fetching yearly patient flow:', error);
      return [];
    }
  }
}
