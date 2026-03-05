import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hr_policies')
export class HRPolicy {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'policy_number' })
    policyNumber: string;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'description', type: 'text' })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
