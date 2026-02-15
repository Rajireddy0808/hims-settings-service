import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  patient_id: string;

  // Personal Information
  @Column({ nullable: true })
  salutation: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column()
  last_name: string;

  @Column({ nullable: true })
  father_spouse_name: string;

  // Demographics
  @Column()
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: string;

  @Column({ nullable: true })
  blood_group: string;

  @Column({ nullable: true })
  marital_status: string;

  // Contact Information
  @Column()
  mobile: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  emergency_contact: string;

  // Address Information
  @Column({ type: 'text' })
  address1: string;

  @Column({ default: 'HYDERABAD' })
  district: string;

  @Column({ default: 'TELANGANA' })
  state: string;

  @Column({ default: 'INDIA' })
  country: string;

  @Column()
  pin_code: string;

  // Medical Information
  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @Column({ type: 'text', nullable: true })
  medical_conditions: string;

  // Registration Information
  @Column({ nullable: true })
  fee: string;

  @Column({ nullable: true })
  fee_type: string;

  @Column({ nullable: true })
  source: string;

  @Column({ nullable: true })
  patient_source_id: number;

  @Column({ nullable: true })
  occupation: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  doctor: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ nullable: true })
  password: string;

  // System Fields
  @Column()
  location_id: number;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: 'active' })
  status: string;
}
