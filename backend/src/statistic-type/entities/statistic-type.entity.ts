import { Game } from 'src/game/entities/game.entity'
import { Statistic } from 'src/statistic/entities/statistic.entity'
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
} from 'typeorm'

@Entity('statistic_types')
export class StatisticType {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @OneToMany(() => Statistic, (statistic) => statistic.statisticType)
    statistics: Statistic[]

    @ManyToOne(() => Game, (game) => game.statisticTypes, {
        onDelete: 'CASCADE',
    })
    game: Game
}
