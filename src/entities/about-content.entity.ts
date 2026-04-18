import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('about_content')
export class AboutContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @Column({ type: 'simple-array', nullable: true })
  image_urls: string[];

  @CreateDateColumn({ name: 'created_at' })
  recordCreatedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  recordUpdatedAt: Date;
}
