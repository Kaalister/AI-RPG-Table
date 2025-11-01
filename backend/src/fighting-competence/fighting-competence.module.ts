import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FightingCompetenceService } from './fighting-competence.service'
import { FightingCompetenceController } from './fighting-competence.controller'
import { FightingCompetence } from './entities/fighting-competence.entity'

@Module({
    imports: [TypeOrmModule.forFeature([FightingCompetence])],
    providers: [FightingCompetenceService],
    controllers: [FightingCompetenceController],
    exports: [FightingCompetenceService],
})
export class FightingCompetenceModule {}
