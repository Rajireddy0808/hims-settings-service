import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('treatment_plan_month')
export class TreatmentPlanMonth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
