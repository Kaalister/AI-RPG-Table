import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageWorkflowService } from './message-workflow.service'

@Controller('messages')
export class MessageController {
    constructor(
        private readonly messageService: MessageService,
        private readonly messageWorkflowService: MessageWorkflowService,
    ) {}

    @Get(':gameId')
    findAllByGame(@Param('gameId') gameId: string) {
        return this.messageService.findAllByGame(gameId)
    }

    @Post()
    async create(
        @Body('content') content: string,
        @Body('gameId') gameId: string,
        @Body('senderId') senderId?: string | null,
        @Body('isCoaching') isCoaching?: boolean,
    ) {
        return this.messageWorkflowService.handleIncomingMessage(
            content,
            gameId,
            senderId ?? null,
            isCoaching,
        )
    }
}
