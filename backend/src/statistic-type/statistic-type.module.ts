import { Module } from '@nestjs/common'
import { StatisticTypeService } from './statistic-type.service'
import { StatisticTypeController } from './statistic-type.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { StatisticType } from './entities/statistic-type.entity'

@Module({
    imports: [TypeOrmModule.forFeature([StatisticType])],
    providers: [StatisticTypeService],
    controllers: [StatisticTypeController],
    exports: [StatisticTypeService],
})
export class StatisticTypeModule {}
