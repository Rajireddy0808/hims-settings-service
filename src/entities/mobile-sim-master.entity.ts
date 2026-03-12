import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MobileOperator } from './mobile-operator.entity';

@Entity('mobile_sim_masters')
export class MobileSimMaster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'mobile_number', unique: true })
  mobileNumber: string;

  @Column({ name: 'operator_id' })
  operatorId: number;

  @ManyToOne(() => MobileOperator)
  @JoinColumn({ name: 'operator_id' })
  operator: MobileOperator;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
