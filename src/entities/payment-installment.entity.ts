import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PatientExamination } from './patient-examination.entity';

@Entity('payment_installments')
export class PaymentInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_examination_id' })
  patientExaminationId: number;

  @Column({ name: 'installment_number' })
  installmentNumber: number;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'payment_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PatientExamination)
  @JoinColumn({ name: 'patient_examination_id' })
  patientExamination: PatientExamination;
}