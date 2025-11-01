import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Gamer } from 'src/gamer/entities/gamer.entity'

@Entity('fighting_competences')
export class FightingCompetence {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    value: number

    @ManyToOne(() => Gamer, (gamer) => gamer.fighting_competences, {
        onDelete: 'CASCADE',
    })
    gamer: Gamer
}
