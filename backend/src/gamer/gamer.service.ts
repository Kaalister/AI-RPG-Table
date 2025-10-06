import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamer } from './entities/gamer.entity';

@Injectable()
export class GamerService {
  constructor(
    @InjectRepository(Gamer)
    private gamersRepository: Repository<Gamer>,
  ) {}

  update(gamerId: string, updateGamerDto: any): Promise<Gamer> {
    return this.gamersRepository.save({ id: gamerId, ...updateGamerDto });
  }

  async delete(gamerId: string): Promise<void> {
    await this.gamersRepository.delete(gamerId);
  }
}
