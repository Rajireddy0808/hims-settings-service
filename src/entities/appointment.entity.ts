import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
import { AppointmentType } from './appointment-type.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  appointment_id: string;

  @Column()
  patient_id: number;

  @Column()
  doctor_id: number;

  @Column({ type: 'date' })
  appointment_date: string;

  @Column({ type: 'time' })
  appointment_time: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  check_for_srdoc_visit: boolean;

  @Column({ type: 'enum', enum: ['consultation', 'follow-up', 'emergency'], default: 'consultation' })
  appointment_type: string;

  @Column()
  appointment_type_id: number;

  @Column({ default: 'scheduled' })
  status: string;

  @Column({ nullable: true })
  location_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => AppointmentType)
  @JoinColumn({ name: 'appointment_type_id' })
  appointmentType: AppointmentType;
}
