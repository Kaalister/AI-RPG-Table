import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { CreateStatisticDto } from 'src/statistic/dto/createStatistic.dto';
import { UpdateStatisticDto } from 'src/statistic/dto/updateStatistic.dto';
import { Game } from 'src/game/entities/game.entity';

export class UpdateGamerDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  age?: number;

  @IsOptional()
  @IsString()
  lore?: string;

  @IsOptional()
  game?: Game;

  @IsOptional()
  @Type(() => CreateStatisticDto)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((statistic: any) =>
          statistic?.id
            ? plainToInstance(UpdateStatisticDto, statistic)
            : plainToInstance(CreateStatisticDto, statistic),
        )
      : undefined,
  )
  @IsArray()
  @ValidateNested({ each: true })
  statistics?: (CreateStatisticDto | UpdateStatisticDto)[];
}
