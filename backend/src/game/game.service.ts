import { plainToInstance } from 'class-transformer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { CreateGameDto } from './dto/createGame.dto';
import { UpdateGameDto } from './dto/updateGame.dto';
import { Gamer } from 'src/gamer/entities/gamer.entity';
import { Statistic } from 'src/statistic/entities/statistic.entity';
import { CreateGamerDto } from 'src/gamer/dto/createGamer.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,
  ) {}

  findAll(): Promise<Game[]> {
    return this.gamesRepository.find({
      relations: ['gamers', 'gamers.statistics'],
    });
  }

  create(createGameDto: CreateGameDto): Promise<Game> {
    const game = this.gamesRepository.create(createGameDto);
    return this.gamesRepository.save(game);
  }

  async update(gameId: string, updateGameDto: UpdateGameDto): Promise<Game> {
    const game = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: ['gamers', 'gamers.statistics'],
    });

    if (!game) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    if (updateGameDto.name !== undefined) {
      game.name = updateGameDto.name;
    }

    if (updateGameDto.lore !== undefined) {
      game.lore = updateGameDto.lore;
    }

    if (updateGameDto.gamers) {
      const mappedGamers = updateGameDto.gamers.map((gamerDto) => {
        const statistics = gamerDto.statistics?.map((statisticDto) =>
          this.gamesRepository.manager.create(Statistic, statisticDto),
        );

        return this.gamesRepository.manager.create(Gamer, {
          ...gamerDto,
          statistics,
          game,
        });
      });

      game.gamers = mappedGamers;
    }

    await this.gamesRepository.save(game);

    const updatedGame = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: ['gamers', 'gamers.statistics'],
    });

    if (!updatedGame) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    return updatedGame;
  }

  async addGamer(gameId: string, gamer: CreateGamerDto) {
    const currentGame = await this.gamesRepository.findOne({
      where: { id: gameId },
      relations: ['gamers', 'gamers.statistics'],
    });

    if (!currentGame) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    currentGame.gamers = [...currentGame.gamers, plainToInstance(Gamer, gamer)];

    return this.gamesRepository.save(currentGame);
  }

  async remove(gameId: string): Promise<{ success: true }> {
    const deleteResult = await this.gamesRepository.delete(gameId);

    if (deleteResult.affected === 0) {
      throw new NotFoundException(`Game with id ${gameId} not found`);
    }

    return { success: true };
  }
}
