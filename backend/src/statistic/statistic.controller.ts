import { Controller } from '@nestjs/common';
import { StatisticService } from './statistic.service';

@Controller('statistics')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
}
