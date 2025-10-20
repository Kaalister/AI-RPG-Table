import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from './entities/message.entity'
import { Game } from '../game/entities/game.entity'

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messagesRepository: Repository<Message>,
    ) {}

    findAllByGame(gameId: string): Promise<Message[]> {
        return this.messagesRepository.find({ where: { game: { id: gameId } } })
    }

    async findRecentByGame(
        gameId: string,
        isCoaching: boolean,
        limit = 20,
    ): Promise<Message[]> {
        const where = isCoaching
            ? { game: { id: gameId } }
            : { game: { id: gameId }, isCoaching: false }

        const recentMessages = await this.messagesRepository.find({
            where,
            order: { date: 'DESC' },
            take: limit,
        })

        return recentMessages.reverse()
    }

    async create(
        content: string,
        gameId: string,
        senderId: string | null = null,
        isCoaching: boolean = false,
    ): Promise<Message> {
        const message = this.messagesRepository.create({
            content,
            senderId,
            game: { id: gameId },
            isCoaching,
        })
        return this.messagesRepository.save(message).then((savedMessage) => {
            if (!savedMessage.game) {
                savedMessage.game = { id: gameId } as Game
            }
            return savedMessage
        })
    }
}
