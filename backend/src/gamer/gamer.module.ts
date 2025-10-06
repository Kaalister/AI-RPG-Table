import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gamer } from './entities/gamer.entity';
import { GamerService } from './gamer.service';
import { GamerController } from './gamer.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gamer])],
  controllers: [GamerController],
  providers: [GamerService],
})
export class GamerModule {}
