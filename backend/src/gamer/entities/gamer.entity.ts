import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    ManyToOne,
} from 'typeorm'
import { Statistic } from 'src/statistic/entities/statistic.entity'
import { Game } from 'src/game/entities/game.entity'
import { FightingCompetence } from 'src/fighting-competence/entities/fighting-competence.entity'
import { Competence } from 'src/competence/entities/competence.entity'

@Entity('gamers')
export class Gamer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    color: string

    @Column()
    age: number

    @Column()
    physical_description: string

    @Column()
    personality: string

    @Column()
    lore: string

    @OneToMany(() => Statistic, (statistic) => statistic.gamer, {
        cascade: true,
        eager: true,
    })
    statistics: Statistic[]

    @OneToMany(() => Competence, (competence) => competence.gamer, {
        cascade: true,
        eager: true,
    })
    competences: Competence[]

    @OneToMany(
        () => FightingCompetence,
        (fightingCompetence) => fightingCompetence.gamer,
        {
            cascade: true,
            eager: true,
        },
    )
    fighting_competences: FightingCompetence[]

    @ManyToOne(() => Game, (game) => game.gamers, {
        onDelete: 'CASCADE',
    })
    game: Game
}
