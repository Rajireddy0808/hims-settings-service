import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_info')
export class UserInfo {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_type', type: 'varchar', length: 10, default: 'staff' })
  userType: string;

  @Column({ name: 'alternate_phone', type: 'varchar', length: 20, nullable: true })
  alternatePhone: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'pincode', type: 'varchar', length: 10, nullable: true })
  pincode: string;

  // Doctor-specific fields
  @Column({ name: 'qualification', type: 'varchar', length: 255, nullable: true })
  qualification: string;

  @Column({ name: 'years_of_experience', type: 'integer', nullable: true })
  yearsOfExperience: number;

  @Column({ name: 'medical_registration_number', type: 'varchar', length: 100, nullable: true })
  medicalRegistrationNumber: string;

  @Column({ name: 'registration_council', type: 'varchar', length: 100, nullable: true })
  registrationCouncil: string;

  @Column({ name: 'registration_valid_until', type: 'date', nullable: true })
  registrationValidUntil: string;

  @Column({ name: 'license_copy', type: 'varchar', length: 255, nullable: true })
  licenseCopy: string;

  @Column({ name: 'degree_certificates', type: 'text', nullable: true })
  degreeCertificates: string;

  @Column({ name: 'employment_type', type: 'varchar', length: 50, nullable: true })
  employmentType: string;

  @Column({ name: 'joining_date', type: 'date', nullable: true })
  joiningDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
