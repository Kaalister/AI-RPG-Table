import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  findAllByGame(gameId: string): Promise<Message[]> {
    return this.messagesRepository.find({ where: { game: { id: gameId } } });
  }

  create(
    content: string,
    gameId: string,
    senderId: string | null = null,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      content,
      senderId,
      game: { id: gameId },
    });
    return this.messagesRepository.save(message);
  }
}
