import {
  IsBoolean,
  IsEmpty,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Game } from '../../game/entities/game.entity';

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  senderId: string;

  @IsOptional()
  @IsBoolean()
  isCoaching: boolean;

  @IsEmpty()
  id: string;
  @IsEmpty()
  game: Game;
  @IsEmpty()
  date: Date;
}
