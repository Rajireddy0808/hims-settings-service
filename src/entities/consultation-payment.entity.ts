import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Consultation } from './consultation.entity';

@Entity('consultation_payments')
export class ConsultationPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  consultation_id: number;

  @Column({ type: 'enum', enum: ['cash', 'card', 'upi'] })
  payment_type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Consultation)
  @JoinColumn({ name: 'consultation_id' })
  consultation: Consultation;
}
