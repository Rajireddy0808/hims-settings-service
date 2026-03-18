import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HRPolicy } from './hr-policy.entity';
import { User } from './user.entity';

@Entity('hr_policy_acceptances')
export class HRPolicyAcceptance {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'policy_id' })
    policyId: number;

    @Column({ name: 'location_id' })
    locationId: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => HRPolicy)
    @JoinColumn({ name: 'policy_id' })
    policy: HRPolicy;
}
