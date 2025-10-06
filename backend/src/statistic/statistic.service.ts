import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statistic } from './entities/statistic.entity';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Statistic)
    private statisticsRepository: Repository<Statistic>,
  ) {}
}
