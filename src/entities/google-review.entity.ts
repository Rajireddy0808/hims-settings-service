import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('google_reviews')
export class GoogleReview {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  branch_name: string; // Miryalaguda | Narasaraopet | Ongole

  @Column({ type: 'varchar', length: 200 })
  reviewer_name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  reviewer_stats: string; // e.g. "Local Guide · 5 reviews"

  @Column({ type: 'text' })
  review_text: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  review_date: string; // e.g. "3 months ago"

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active | inactive

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
