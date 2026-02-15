import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mobile_numbers')
export class MobileNumber {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  mobile: string;

  @Column({ type: 'integer', nullable: true })
  user_id: number;

  @Column({ type: 'integer', nullable: true })
  location_id: number;

  @Column({ type: 'integer', nullable: true })
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'date', nullable: true })
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

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
}