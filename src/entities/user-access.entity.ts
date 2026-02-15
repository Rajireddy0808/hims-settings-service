import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('user_access')
export class UserAccess {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ name: 'role_id' })
  roleId: number;

  @ApiProperty()
  @Column({ name: 'module_id' })
  moduleId: number;

  @ApiProperty()
  @Column({ name: 'sub_module_id', nullable: true })
  subModuleId: number | null;

  @ApiProperty()
  @Column({ default: 0 })
  add: number;

  @ApiProperty()
  @Column({ default: 0 })
  edit: number;

  @ApiProperty()
  @Column({ name: 'delete', default: 0 })
  delete: number;

  @ApiProperty()
  @Column({ default: 0 })
  view: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
