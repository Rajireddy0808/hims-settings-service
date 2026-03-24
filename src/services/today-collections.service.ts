import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientExamination } from '../entities/patient-examination.entity';
import { PaymentInstallment } from '../entities/payment-installment.entity';

@Injectable()
export class TodayCollectionsService {
  constructor(
    @InjectRepository(PaymentInstallment)
    private paymentInstallmentRepository: Repository<PaymentInstallment>,
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

    const query = this.paymentInstallmentRepository
      .createQueryBuilder('pi')
      .leftJoin('patient_examination', 'pe', 'pe.id = pi.patientExaminationId')
      .leftJoin('patients', 'p', 'p.id::text = pe.patient_id::text')
      .select([
        'pe.id as examinationid',
        'pe.patient_id as patientid',
        'pe.createdAt as examinationdate',
        'pe.totalAmount as totalamount',
        'pi.id as installmentid',
        'pi.amount as installmentamount',
        'pi.paymentDate as paymentdate',
        'pi.paymentMethod as paymentmethod',
        'p.first_name as firstname',
        'p.last_name as lastname',
        'p.patient_id as custompatientid'
      ])
      .where('pi.paymentDate >= :startOfDay', { startOfDay })
      .andWhere('pi.paymentDate <= :endOfDay', { endOfDay });

    if (locationId) {
      query.andWhere('pe.locationId = :locationId', { locationId });
    }

    query.orderBy('pi.paymentDate', 'DESC');

    return query.getRawMany();
  }
}