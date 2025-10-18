import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Gamer } from 'src/gamer/entities/gamer.entity';

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  value: number;

  @ManyToOne(() => Gamer, (gamer) => gamer.statistics, {
    onDelete: 'CASCADE',
  })
  gamer: Gamer;
}
