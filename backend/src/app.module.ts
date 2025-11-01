import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AiModule } from './ai/ai.module'
import { Game } from './game/entities/game.entity'
import { Gamer } from './gamer/entities/gamer.entity'
import { Message } from './message/entities/message.entity'
import { Statistic } from './statistic/entities/statistic.entity'
import { FightingCompetence } from './fighting-competence/entities/fighting-competence.entity'
import { GameModule } from './game/game.module'
import { MessageModule } from './message/message.module'
import { GamerModule } from './gamer/gamer.module'
import { StatisticModule } from './statistic/statistic.module'
import { CompetenceModule } from './competence/competence.module'
import { FightingCompetenceModule } from './fighting-competence/fighting-competence.module'
import { Competence } from './competence/entities/competence.entity'
import { StatisticTypeModule } from './statistic-type/statistic-type.module'
import { StatisticType } from './statistic-type/entities/statistic-type.entity'

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'db.sqlite',
            entities: [
                Game,
                Gamer,
                Message,
                Statistic,
                Competence,
                FightingCompetence,
                StatisticType,
            ],
            synchronize: true,
        }),
        TypeOrmModule.forFeature([
            Game,
            Gamer,
            Message,
            Statistic,
            Competence,
            FightingCompetence,
            StatisticType,
        ]),
        AiModule,
        GameModule,
        MessageModule,
        GamerModule,
        StatisticModule,
        CompetenceModule,
        FightingCompetenceModule,
        StatisticTypeModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
