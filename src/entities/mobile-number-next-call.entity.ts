import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mobile_number_next_call_ob')
export class MobileNumberNextCall {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  mobile_number_id: number;

  @Column({ type: 'date' })
  next_call_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  disposition: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  patient_feeling: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'integer', nullable: true })
  caller_by: number;

  @Column({ type: 'timestamp', nullable: true })
  caller_created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  caller_updated_at: Date;
}
