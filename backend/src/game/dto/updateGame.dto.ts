import { PickType } from '@nestjs/swagger'
import { CreateGameDto } from './createGame.dto'
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator'
import { plainToInstance, Transform, Type } from 'class-transformer'
import { CreateGamerDto } from 'src/gamer/dto/createGamer.dto'
import { UpdateGamerDto } from 'src/gamer/dto/updateGamer.dto'
import { CreateMessageDto } from 'src/message/dto/createMessage.dto'

export class UpdateGameDto extends PickType(CreateGameDto, [
    'id',
    'statisticTypes',
]) {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    lore?: string

    @Type(() => CreateMessageDto)
    @ValidateNested({ each: true })
    @IsArray()
    @IsOptional()
    messages?: CreateMessageDto[]

    @Type(() => CreateGamerDto)
    @ValidateNested({ each: true })
    @IsArray()
    @Transform(({ value }) =>
        Array.isArray(value)
            ? value.map((gamer: any) =>
                  gamer?.id
                      ? plainToInstance(UpdateGamerDto, gamer)
                      : plainToInstance(CreateGamerDto, gamer),
              )
            : undefined,
    )
    @IsOptional()
    gamers?: (CreateGamerDto | UpdateGamerDto)[]
}
