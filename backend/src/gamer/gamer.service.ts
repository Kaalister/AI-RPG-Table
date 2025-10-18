import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamer } from './entities/gamer.entity';
import { CreateGameDto } from 'src/game/dto/createGame.dto';
import { UpdateGamerDto } from './dto/updateGamer.dto';

@Injectable()
export class GamerService {
  constructor(
    @InjectRepository(Gamer)
    private gamersRepository: Repository<Gamer>,
  ) {}

  create(gamer: CreateGameDto) {
    return this.gamersRepository.save(this.gamersRepository.create(gamer));
  }

  update(gamerId: string, updateGamerDto: UpdateGamerDto): Promise<Gamer> {
    return this.gamersRepository.save({ id: gamerId, ...updateGamerDto });
  }

  async delete(gamerId: string): Promise<void> {
    await this.gamersRepository.delete(gamerId);
  }
}
