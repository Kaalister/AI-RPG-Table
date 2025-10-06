import { IsEmpty, IsNotEmpty } from 'class-validator';

export class CreateStatisticDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  value: number;

  @IsEmpty()
  id: string;
}
