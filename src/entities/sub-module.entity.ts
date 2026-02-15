import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Module } from './module.entity';

@Entity('sub_modules')
export class SubModule {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'module_id' })
  moduleId: number;

  @ManyToOne(() => Module)
  @JoinColumn({ name: 'module_id' })
  module: Module;

  @ApiProperty()
  @Column({ name: 'subcat_name' })
  subcatName: string;

  @ApiProperty()
  @Column({ name: 'subcat_path' })
  subcatPath: string;

  @ApiProperty()
  @Column({ name: 'icon', nullable: true })
  icon: string;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
