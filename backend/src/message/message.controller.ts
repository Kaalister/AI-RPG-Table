import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':gameId')
  findAllByGame(@Param('gameId') gameId: string) {
    return this.messageService.findAllByGame(gameId);
  }

  @Post()
  create(
    @Body('content') content: string,
    @Body('gameId') gameId: string,
    @Body('senderId') senderId?: string | null,
    @Body('isCoaching') isCoaching?: boolean,
  ) {
    return this.messageService.create(
      content,
      gameId,
      senderId ?? null,
      isCoaching,
    );
  }
}
