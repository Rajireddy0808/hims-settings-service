import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PatientExamination } from './patient-examination.entity';

@Entity('patient_payments')
export class PatientPayments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_examination_id' })
  patientExaminationId: number;

  @Column({ name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PatientExamination)
  @JoinColumn({ name: 'patient_examination_id' })
  patientExamination: PatientExamination;
}