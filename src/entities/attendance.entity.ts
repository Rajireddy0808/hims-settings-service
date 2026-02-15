import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Location } from './location.entity';
import { UserStatus } from './user-status.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'location_id' })
  locationId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time', name: 'check_in', nullable: true })
  checkIn: string;

  @Column({ type: 'time', name: 'check_out', nullable: true })
  checkOut: string;

  @Column({ type: 'int', default: 0 })
  duration: number; // Duration in minutes

  @Column({ type: 'varchar', length: 50, default: 'Present' })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'leave_type' })
  leave_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'leave_status' })
  leave_status: string;

  @Column({ name: 'user_status_id', nullable: true })
  userStatusId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @ManyToOne(() => UserStatus)
  @JoinColumn({ name: 'user_status_id' })
  userStatus: UserStatus;
}
