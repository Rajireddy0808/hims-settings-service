import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user_status')
export class UserStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'status_name', length: 50, unique: true })
  statusName: string;

  @Column({ name: 'color_code', length: 7 })
  colorCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
