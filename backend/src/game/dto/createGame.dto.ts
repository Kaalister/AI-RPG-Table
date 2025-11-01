import {
    IsArray,
    IsEmpty,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'
import { plainToInstance, Transform } from 'class-transformer'
import { Message } from 'src/message/entities/message.entity'
import { Gamer } from 'src/gamer/entities/gamer.entity'
import { StatisticType } from 'src/statistic-type/entities/statistic-type.entity'
import { CreateStatisticTypeDto } from 'src/statistic-type/dto/createStatisticType.dto'
import { UpdateStatisticTypeDto } from 'src/statistic-type/dto/updateStatisticType.dto'
import { Type } from 'class-transformer'

export class CreateGameDto {
    @IsNotEmpty()
    @IsString()
    name!: string

    @IsNotEmpty()
    @IsString()
    lore!: string

    @IsOptional()
    @Type(() => StatisticType)
    @ValidateNested({ each: true })
    @IsArray()
    @Transform(({ value }) =>
        Array.isArray(value)
            ? value.map((statistic: any) =>
                  statistic?.id
                      ? plainToInstance(UpdateStatisticTypeDto, statistic)
                      : plainToInstance(CreateStatisticTypeDto, statistic),
              )
            : [],
    )
    statisticTypes?: StatisticType[]

    @IsEmpty()
    id?: string
    @IsEmpty()
    messages?: Message[]
    @IsEmpty()
    gamers?: Gamer[]
}
