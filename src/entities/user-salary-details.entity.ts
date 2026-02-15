import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_salary_details')
export class UserSalaryDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'salary_amount' })
  salaryAmount: number;

  @Column({ type: 'date', name: 'joining_date' })
  joiningDate: Date;

  @Column({ type: 'date', nullable: true, name: 'next_hike_date' })
  nextHikeDate: Date;

  @Column({ nullable: true, name: 'created_by' })
  createdBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
