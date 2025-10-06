import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './ai/ai.module';
import { Game } from './game/entities/game.entity';
import { Gamer } from './gamer/entities/gamer.entity';
import { Message } from './message/entities/message.entity';
import { Statistic } from './statistic/entities/statistic.entity';
import { GameModule } from './game/game.module';
import { MessageModule } from './message/message.module';
import { GamerModule } from './gamer/gamer.module';
import { StatisticModule } from './statistic/statistic.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Game, Gamer, Message, Statistic],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, Gamer, Message, Statistic]),
    AiModule,
    GameModule,
    MessageModule,
    GamerModule,
    StatisticModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
