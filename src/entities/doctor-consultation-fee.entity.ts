import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('doctor_consultation_fee')
export class DoctorConsultationFee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ name: 'fee', type: 'decimal', precision: 10, scale: 2 })
  fee: number;

  @Column({ default: 1 })
  status: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
