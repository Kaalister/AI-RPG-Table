import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Gamer } from 'src/gamer/entities/gamer.entity'
import { StatisticType } from 'src/statistic-type/entities/statistic-type.entity'

@Entity('statistics')
export class Statistic {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    value: number

    @ManyToOne(
        () => StatisticType,
        (statisticType) => statisticType.statistics,
        {
            orphanedRowAction: 'delete',
            onDelete: 'CASCADE',
            eager: true,
        },
    )
    statisticType: StatisticType

    @ManyToOne(() => Gamer, (gamer) => gamer.statistics, {
        onDelete: 'CASCADE',
    })
    gamer: Gamer
}
