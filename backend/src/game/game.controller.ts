import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/createGame.dto';
import { UpdateGameDto } from './dto/updateGame.dto';
import { CreateGamerDto } from 'src/gamer/dto/createGamer.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  findAll() {
    return this.gameService.findAll();
  }

  @Post()
  create(@Body() createGameDto: CreateGameDto) {
    return this.gameService.create(createGameDto);
  }

  @Post(':gameId/addGamer')
  addGamer(@Param('gameId') gameId: string, @Body() gamer: CreateGamerDto) {
    return this.gameService.addGamer(gameId, gamer);
  }

  @Patch(':gameId')
  update(
    @Param('gameId') gameId: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(gameId, updateGameDto);
  }

  @Delete(':gameId')
  remove(@Param('gameId') gameId: string) {
    return this.gameService.remove(gameId);
  }
}
