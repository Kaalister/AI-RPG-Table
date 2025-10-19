import { Game } from 'src/game/entities/game.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'text', nullable: true, default: null })
  senderId: string | null;

  @Column({ type: 'boolean', default: false })
  isCoaching: boolean;

  @CreateDateColumn({ type: 'datetime' })
  date: Date;

  @ManyToOne(() => Game, (game) => game.id)
  game: Game;
}
