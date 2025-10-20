import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import { Message } from './entities/message.entity'

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class MessageGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(MessageGateway.name)

    @WebSocketServer()
    private readonly server: Server

    handleConnection(client: Socket) {
        this.logger.debug(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket) {
        this.logger.debug(`Client disconnected: ${client.id}`)
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(
        @MessageBody()
        payload: {
            gameId?: string
        },
        @ConnectedSocket() client: Socket,
    ) {
        const gameId = payload?.gameId
        if (!gameId) {
            return
        }

        client.join(this.roomName(gameId))
        client.emit('game.joined', { gameId })
    }

    @SubscribeMessage('leaveGame')
    handleLeaveGame(
        @MessageBody()
        payload: {
            gameId?: string
        },
        @ConnectedSocket() client: Socket,
    ) {
        const gameId = payload?.gameId
        if (!gameId) {
            return
        }

        client.leave(this.roomName(gameId))
        client.emit('game.left', { gameId })
    }

    emitMessageCreated(message: Message) {
        const payload = this.mapMessage(message)
        const { gameId } = payload

        if (gameId) {
            this.server
                .to(this.roomName(gameId))
                .emit('message.created', payload)
            return
        }

        this.server.emit('message.created', payload)
    }

    private roomName(gameId: string) {
        return `game:${gameId}`
    }

    private mapMessage(message: Message) {
        const gameId = (message.game as { id?: string } | undefined)?.id

        return {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            isCoaching: message.isCoaching,
            date: message.date,
            gameId:
                gameId ?? (message as unknown as { gameId?: string }).gameId,
        }
    }
}
