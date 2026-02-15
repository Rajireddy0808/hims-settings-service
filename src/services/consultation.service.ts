import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Consultation } from '../entities/consultation.entity';
import { ConsultationPayment } from '../entities/consultation-payment.entity';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultation)
    private consultationRepository: Repository<Consultation>,
    @InjectRepository(ConsultationPayment)
    private consultationPaymentRepository: Repository<ConsultationPayment>,
    private dataSource: DataSource,
  ) {}

  private async ensureTablesExist() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS consultations (
          id SERIAL PRIMARY KEY,
          consultation_id VARCHAR UNIQUE NOT NULL,
          patient_id INTEGER NOT NULL,
          doctor_id INTEGER NOT NULL,
          consultation_fee DECIMAL(10,2) NOT NULL,
          location_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await queryRunner.query(`
        DO $$ BEGIN
          CREATE TYPE consultation_payment_type AS ENUM ('cash', 'card', 'upi');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `);
      
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS consultation_payments (
          id SERIAL PRIMARY KEY,
          consultation_id INTEGER NOT NULL,
          payment_type consultation_payment_type NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (consultation_id) REFERENCES consultations(id)
        )
      `);
    } finally {
      await queryRunner.release();
    }
  }

  async recordConsultation(consultationData: any, locationId: number) {
    // Ensure tables exist
    await this.ensureTablesExist();
    
    // Generate consultation ID
    let nextId = 1;
    try {
      const lastConsultation = await this.consultationRepository
        .createQueryBuilder('consultation')
        .where("consultation.consultation_id ~ '^CON[0-9]+$'")
        .orderBy("CAST(SUBSTRING(consultation.consultation_id FROM 4) AS INTEGER)", 'DESC')
        .getOne();

      nextId = lastConsultation 
        ? parseInt(lastConsultation.consultation_id.substring(3)) + 1 
        : 1;
    } catch (error) {
      // If table doesn't exist or query fails, start with 1
      nextId = 1;
    }
    const consultationId = `CON${String(nextId).padStart(4, '0')}`;

    const consultation = this.consultationRepository.create({
      consultation_id: consultationId,
      patient_id: consultationData.patientId,
      doctor_id: consultationData.doctorId,
      consultation_fee: consultationData.consultationFee,
      location_id: locationId,
    });

    const savedConsultation = await this.consultationRepository.save(consultation);

    // Save multiple payments
    if (consultationData.payments && consultationData.payments.length > 0) {
      const paymentEntries = consultationData.payments.map(payment => 
        this.consultationPaymentRepository.create({
          consultation_id: savedConsultation.id,
          payment_type: payment.type,
          amount: parseFloat(payment.amount)
        })
      );
      await this.consultationPaymentRepository.save(paymentEntries);
    }

    return {
      message: 'Consultation fee recorded successfully',
      consultation: {
        id: savedConsultation.id,
        consultationId: savedConsultation.consultation_id,
        fee: savedConsultation.consultation_fee,
        payments: consultationData.payments
      }
    };
  }
}
