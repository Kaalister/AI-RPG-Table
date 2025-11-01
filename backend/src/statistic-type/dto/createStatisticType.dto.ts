import { IsEmpty, IsNotEmpty } from 'class-validator'

export class CreateStatisticTypeDto {
    @IsNotEmpty()
    name: string

    @IsEmpty()
    id: string
}
