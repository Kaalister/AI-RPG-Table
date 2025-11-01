import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Gamer } from 'src/gamer/entities/gamer.entity'

@Entity('competences')
export class Competence {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    value: number

    @ManyToOne(() => Gamer, (gamer) => gamer.competences, {
        onDelete: 'CASCADE',
    })
    gamer: Gamer
}
