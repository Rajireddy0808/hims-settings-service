import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientExamination } from '../entities/patient-examination.entity';
import { PaymentInstallment } from '../entities/payment-installment.entity';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class TodayCollectionsService {
  constructor(
    @InjectRepository(PaymentInstallment)
    private paymentInstallmentRepository: Repository<PaymentInstallment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async getTodayCollections(locationId?: number, fromDate?: string, toDate?: string) {
    let startOfDay: Date;
    let endOfDay: Date;

    if (fromDate && toDate) {
      startOfDay = new Date(fromDate);
      endOfDay = new Date(toDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      const today = new Date();
      startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }

    // 1. Fetch Payment Installments (Examination Billing)
    const installmentsQuery = this.paymentInstallmentRepository
      .createQueryBuilder('pi')
      .leftJoin('patient_examination', 'pe', 'pe.id = pi.patientExaminationId')
      .leftJoin('patients', 'p', 'p.id::text = pe.patient_id::text')
      .select([
        'pe.id as examinationid',
        'pe.patient_id as patientid',
        'pe.createdAt as examinationdate',
        'pe.totalAmount as totalamount',
        'string_agg(pi.amount::text, \', \') as installmentamount',
        'sum(pi.amount) as total_installment_amount',
        'MAX(pi.paymentDate) as paymentdate',
        'string_agg(pi.paymentMethod, \', \') as paymentmethod',
        'p.first_name as firstname',
        'p.last_name as lastname',
        'p.patient_id as custompatientid',
        'p.fee as patient_fee',
        'p.fee_type as patient_fee_type',
        '0 as patient_amount', // Set to 0 to avoid double counting registration fees
        'pe.locationId as locationid'
      ])
      .where('pi.paymentDate >= :startOfDay', { startOfDay })
      .andWhere('pi.paymentDate <= :endOfDay', { endOfDay });

    if (locationId) {
      installmentsQuery.andWhere('pe.locationId = :locationId', { locationId });
    }

    installmentsQuery.groupBy('pe.id, pe.patient_id, pe.createdAt, pe.totalAmount, p.id, p.first_name, p.last_name, p.patient_id, p.fee, p.fee_type, pe.locationId');
    
    const installments = await installmentsQuery.getRawMany();

    // 2. Fetch Patient Registration Fees
    const registrationsQuery = this.patientRepository
      .createQueryBuilder('p')
      .select([
        '(p.id * -1) as examinationid', // Use negative ID to avoid conflict with actual examination IDs
        'p.id as patientid',
        'p.created_at as examinationdate',
        '0 as totalamount',
        '\'\' as installmentamount',
        '0 as total_installment_amount',
        'p.created_at as paymentdate',
        'p.fee_type as paymentmethod',
        'p.first_name as firstname',
        'p.last_name as lastname',
        'p.patient_id as custompatientid',
        'p.fee as patient_fee',
        'p.fee_type as patient_fee_type',
        'p.amount as patient_amount',
        'p.location_id as locationid'
      ])
      .where('p.created_at >= :startOfDay', { startOfDay })
      .andWhere('p.created_at <= :endOfDay', { endOfDay })
      .andWhere('p.amount > 0');

    if (locationId) {
      registrationsQuery.andWhere('p.location_id = :locationId', { locationId });
    }

    const registrations = await registrationsQuery.getRawMany();

    // 3. Combine results
    const combined = [...installments, ...registrations].sort((a, b) => {
      const dateA = new Date(a.paymentdate).getTime();
      const dateB = new Date(b.paymentdate).getTime();
      return dateB - dateA;
    });

    return combined;
  }
}