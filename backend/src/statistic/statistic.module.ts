import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Statistic } from './entities/statistic.entity'
import { StatisticService } from './statistic.service'
import { StatisticController } from './statistic.controller'

@Module({
    imports: [TypeOrmModule.forFeature([Statistic])],
    controllers: [StatisticController],
    providers: [StatisticService],
})
export class StatisticModule {}
