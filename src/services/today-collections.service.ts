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
      .select([
      
        'pe.createdAt as examinationDate',
        'pe.totalAmount as totalAmount',
        'pi.id as installmentId',
        'pi.amount as installmentAmount',
        'pi.paymentDate as paymentDate',
        'pi.paymentMethod as paymentMethod'
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