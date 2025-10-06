import { Controller, Put, Body, Param, Delete } from '@nestjs/common';
import { GamerService } from './gamer.service';

@Controller('gamers')
export class GamerController {
  constructor(private readonly gamerService: GamerService) {}

  @Put(':gamerId')
  update(@Param('gamerId') gamerId: string, @Body() updateGamerDto: any) {
    return this.gamerService.update(gamerId, updateGamerDto);
  }

  @Delete(':gamerId')
  delete(@Param('gamerId') gamerId: string) {
    return this.gamerService.delete(gamerId);
  }
}
