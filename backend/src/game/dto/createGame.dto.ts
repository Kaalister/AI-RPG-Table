import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';
import { Message } from 'src/message/entities/message.entity';
import { Gamer } from 'src/gamer/entities/gamer.entity';

export class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  lore!: string;

  @IsEmpty()
  id?: string;
  @IsEmpty()
  messages?: Message[];
  @IsEmpty()
  gamers?: Gamer[];
}
