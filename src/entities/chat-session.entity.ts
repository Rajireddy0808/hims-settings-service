import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  guestId: string;

  @Column({ nullable: true })
  visitorName: string;

  @Column({ nullable: true })
  visitorEmail: string;

  @Column({ default: 'active' })
  status: string; // active, closed

  @Column({ default: true })
  isRead: boolean;

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages: ChatMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
