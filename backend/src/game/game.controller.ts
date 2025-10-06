import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/createGame.dto';
import { UpdateGameDto } from './dto/updateGame.dto';

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

  @Patch(':gameId')
  update(
    @Param('gameId') gameId: string,
    @Body() updateGameDto: UpdateGameDto,
  ) {
    return this.gameService.update(gameId, updateGameDto);
  }
}
