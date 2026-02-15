import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('hospital_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  hospital_name: string;

  @Column({ nullable: true })
  hospital_heading: string;

  @Column({ nullable: true, type: 'text' })
  hospital_logo: string;

  @CreateDateColumn()
  created_at: Date;
}
