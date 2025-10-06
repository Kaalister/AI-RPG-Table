import { Game } from 'src/game/entities/game.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  @Column({ type: 'text', nullable: true, default: null })
  senderId: string | null;

  @Column()
  date: Date;

  @ManyToOne(() => Game, (game) => game.id)
  game: Game;
}
