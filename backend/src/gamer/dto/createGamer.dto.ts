import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Game } from '../../game/entities/game.entity';
import { CreateStatisticDto } from 'src/statistic/dto/createStatistic.dto';
import { UpdateStatisticDto } from 'src/statistic/dto/updateStatistic.dto';

export class CreateGamerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  color: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsString()
  lore: string;

  @IsOptional()
  @Type(() => CreateStatisticDto)
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value.map((statistic: any) =>
          statistic?.id
            ? plainToInstance(UpdateStatisticDto, statistic)
            : plainToInstance(CreateStatisticDto, statistic),
        )
      : [],
  )
  @IsArray()
  @ValidateNested({ each: true })
  statistics: (CreateStatisticDto | UpdateStatisticDto)[];

  @IsEmpty()
  id: string;
  @IsEmpty()
  game: Game;
}
