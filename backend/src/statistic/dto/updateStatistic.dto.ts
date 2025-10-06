import { IsNumber, IsOptional, IsString } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { CreateStatisticDto } from './createStatistic.dto';

export class UpdateStatisticDto extends PickType(CreateStatisticDto, ['id']) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  value: number;
}
