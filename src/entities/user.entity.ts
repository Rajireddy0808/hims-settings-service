import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from './user-info.entity';

@Entity('users')
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  username: string;

  @ApiProperty()
  @Column()
  password: string;

  @ApiProperty()
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty()
  @Column({ unique: true, nullable: true })
  email: string;

  @ApiProperty()
  @Column({ nullable: true })
  phone: string;



  @ApiProperty()
  @Column({ name: 'primary_location_id', nullable: true })
  primaryLocationId: number;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ name: 'user_info_id', nullable: true })
  userInfoId: number;

  @ApiProperty()
  @Column({ name: 'employee_id' })
  employeeId: string;

  @ApiProperty()
  @Column({ name: 'working_days', nullable: true, length: 250 })
  workingDays: string;

  @ApiProperty()
  @Column({ name: 'working_hours', nullable: true, length: 250 })
  workingHours: string;

  @OneToOne(() => UserInfo)
  @JoinColumn({ name: 'user_info_id' })
  userInfo: UserInfo;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
