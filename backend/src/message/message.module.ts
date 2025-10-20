import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Message } from './entities/message.entity'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { MessageWorkflowService } from './message-workflow.service'
import { MessageGateway } from './message.gateway'
import { GameModule } from '../game/game.module'
import { AiModule } from '../ai/ai.module'

@Module({
    imports: [TypeOrmModule.forFeature([Message]), GameModule, AiModule],
    controllers: [MessageController],
    providers: [MessageService, MessageWorkflowService, MessageGateway],
})
export class MessageModule {}
