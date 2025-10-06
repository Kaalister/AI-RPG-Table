import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Gamer } from 'src/gamer/entities/gamer.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lore: string;

  @OneToMany(() => Message, (message) => message.game)
  messages: Message[];

  @OneToMany(() => Gamer, (gamer) => gamer.game, {
    cascade: true,
  })
  gamers: Gamer[];
}
