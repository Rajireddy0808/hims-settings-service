import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MobileSimMaster } from './mobile-sim-master.entity';
import { User } from './user.entity';

@Entity('mobile_recharge_plans')
export class MobileRechargePlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'sim_master_id' })
  simMasterId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'recharge_days' })
  rechargeDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'recharge_date', type: 'date' })
  rechargeDate: string;

  @Column({ name: 'next_recharge_date', type: 'date' })
  nextRechargeDate: string;

  @ManyToOne(() => MobileSimMaster)
  @JoinColumn({ name: 'sim_master_id' })
  simMaster: MobileSimMaster;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
