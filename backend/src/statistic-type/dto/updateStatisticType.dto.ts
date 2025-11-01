import { IsNumber, IsOptional, IsString } from 'class-validator'
import { PickType } from '@nestjs/swagger'
import { CreateStatisticTypeDto } from './createStatisticType.dto'

export class UpdateStatisticTypeDto extends PickType(CreateStatisticTypeDto, [
    'id',
]) {
    @IsOptional()
    @IsString()
    name: string
}
