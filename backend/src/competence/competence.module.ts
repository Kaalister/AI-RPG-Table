import { Module } from '@nestjs/common'
import { CompetenceService } from './competence.service'
import { CompetenceController } from './competence.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Competence } from './entities/competence.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Competence])],
    providers: [CompetenceService],
    controllers: [CompetenceController],
    exports: [CompetenceService],
})
export class CompetenceModule {}
