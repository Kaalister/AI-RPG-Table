import { Injectable, Logger } from '@nestjs/common'
import { MessageService } from './message.service'
import { GameService } from '../game/game.service'
import { AiService } from '../ai/ai.service'
import { Message } from './entities/message.entity'
import { Game } from '../game/entities/game.entity'
import { Gamer } from '../gamer/entities/gamer.entity'
import { MessageGateway } from './message.gateway'

const COACH_SENDER_ID = 'ai-coach'

@Injectable()
export class MessageWorkflowService {
    private readonly logger = new Logger(MessageWorkflowService.name)

    constructor(
        private readonly messageService: MessageService,
        private readonly gameService: GameService,
        private readonly aiService: AiService,
        private readonly messageGateway: MessageGateway,
    ) {}

    async handleIncomingMessage(
        content: string,
        gameId: string,
        senderId: string | null = null,
        isCoaching = false,
    ): Promise<Message> {
        const baseMessage = await this.messageService.create(
            content,
            gameId,
            senderId,
            isCoaching,
        )

        this.messageGateway.emitMessageCreated(baseMessage)

        const game = await this.gameService.findByIdWithDetails(gameId)
        const conversation = await this.messageService.findRecentByGame(
            gameId,
            true,
        )
        const playerConversation = await this.messageService.findRecentByGame(
            gameId,
            false,
        )

        if (!conversation.find((message) => message.id === baseMessage.id)) {
            conversation.push(baseMessage)
            this.trimConversation(conversation)
        }

        if (
            !isCoaching &&
            !playerConversation.find((message) => message.id === baseMessage.id)
        ) {
            playerConversation.push(baseMessage)
            this.trimConversation(playerConversation)
        }

        if (isCoaching) {
            await this.runCoachDiscussion({
                game,
                gamers: game.gamers,
                conversation,
                baseMessage,
            })
        } else {
            await this.runPlayersReactions({
                game,
                gamers: game.gamers,
                conversation: playerConversation,
                baseMessage,
            })

            await this.runCoachReaction({
                game,
                gamers: game.gamers,
                conversation,
                baseMessage,
            })
        }

        return baseMessage
    }

    private async runPlayersReactions(params: {
        game: Game
        gamers: Gamer[]
        conversation: Message[]
        baseMessage: Message
    }) {
        const { game, gamers, conversation, baseMessage } = params

        for (const gamer of gamers) {
            if (baseMessage.senderId && baseMessage.senderId === gamer.id)
                continue

            try {
                const reaction = await this.aiService.generatePlayerReaction({
                    gamer,
                    game,
                    conversation,
                    baseMessage,
                })

                if (!reaction || reaction === '__NO_REACT__') {
                    continue
                }

                const savedReaction = await this.messageService.create(
                    reaction,
                    game.id,
                    gamer.id,
                    false,
                )

                conversation.push(savedReaction)
                this.trimConversation(conversation)
                this.messageGateway.emitMessageCreated(savedReaction)
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : String(error)
                this.logger.error(
                    `Failed to generate reaction for gamer ${gamer.id} in game ${game.id}: ${errorMessage}`,
                    error instanceof Error ? error.stack : undefined,
                )
            }
        }
    }

    private async runCoachReaction(params: {
        game: Game
        gamers: Gamer[]
        conversation: Message[]
        baseMessage: Message
    }) {
        const { game, gamers, conversation, baseMessage } = params

        try {
            const reaction = await this.aiService.generateCoachReaction({
                game,
                gamers,
                conversation,
                baseMessage,
            })

            if (!reaction || reaction === '__NO_REACT__') {
                return
            }

            const savedReaction = await this.messageService.create(
                reaction,
                game.id,
                COACH_SENDER_ID,
                true,
            )

            conversation.push(savedReaction)
            this.trimConversation(conversation)
            this.messageGateway.emitMessageCreated(savedReaction)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            this.logger.error(
                `Failed to generate coaching reaction for game ${game.id}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            )
        }
    }

    private async runCoachDiscussion(params: {
        game: Game
        gamers: Gamer[]
        conversation: Message[]
        baseMessage: Message
    }) {
        const { game, gamers, conversation, baseMessage } = params

        try {
            const message = await this.aiService.generateCoachMessage({
                game,
                gamers,
                conversation,
                baseMessage,
            })

            if (!message || message === '__NO_REACT__') {
                return
            }

            const savedMessage = await this.messageService.create(
                message,
                game.id,
                COACH_SENDER_ID,
                true,
            )

            conversation.push(savedMessage)
            this.trimConversation(conversation)
            this.messageGateway.emitMessageCreated(savedMessage)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : String(error)
            this.logger.error(
                `Failed to generate coaching reaction for game ${game.id}: ${errorMessage}`,
                error instanceof Error ? error.stack : undefined,
            )
        }
    }

    private trimConversation(conversation: Message[], maxSize = 20) {
        if (conversation.length > maxSize) {
            conversation.splice(0, conversation.length - maxSize)
        }
    }

    private getPlayerSenderId(gamerId: string) {
        return `ai-${gamerId}`
    }
}
