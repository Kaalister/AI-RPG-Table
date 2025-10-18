import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Statistic } from 'src/statistic/entities/statistic.entity';
import { Game } from 'src/game/entities/game.entity';

@Entity('gamers')
export class Gamer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @Column()
  age: number;

  @Column()
  lore: string;

  @OneToMany(() => Statistic, (statistic) => statistic.gamer, {
    cascade: true,
    eager: true,
  })
  statistics: Statistic[];

  @ManyToOne(() => Game, (game) => game.gamers, {
    onDelete: 'CASCADE',
  })
  game: Game;
}
