import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('call_history')
export class CallHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mobile_number_id', nullable: true })
  mobileNumberId: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number;

  @Column({ name: 'patient_id', nullable: true })
  patientId: string;

  @Column({ name: 'location_id', nullable: true })
  locationId: number;

  @Column({ name: 'next_call_date', type: 'date', nullable: true })
  nextCallDate: Date;

  @Column({ name: 'caller_by', nullable: true })
  callerBy: string;

  @Column({ name: 'patient_feeling', nullable: true })
  patientFeeling: string;

  @Column({ nullable: true })
  disposition: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
