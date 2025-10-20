import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { spawn } from 'child_process'
import { Gamer } from '../gamer/entities/gamer.entity'
import { Game } from '../game/entities/game.entity'
import { Message } from '../message/entities/message.entity'

type PlayerReactionInput = {
    gamer: Gamer
    game: Game
    conversation: Message[]
    baseMessage: Message
}

type CoachReactionInput = {
    game: Game
    gamers: Gamer[]
    conversation: Message[]
    baseMessage: Message
}

@Injectable()
export class AiService {
    async generatePlayerReaction(input: PlayerReactionInput): Promise<string> {
        const { gamer, game, conversation, baseMessage } = input

        const statsDescription = this.describeStatistics(gamer)
        const conversationSummary = this.buildConversationSummary(
            game,
            conversation,
        )

        const promptSections = [
            `Tu es ${gamer.name}. ${gamer.lore}`,
            game.lore
                ? `Voici le contexte de la campagne "${game.name}" : ${game.lore}`
                : `Tu joues dans la campagne "${game.name}". Aucun lore additionnel n'est disponible.`,
            statsDescription
                ? `Tes caractéristiques actuelles : ${statsDescription}`
                : null,
            conversationSummary
                ? `Résumé des derniers échanges entre les participants : ${conversationSummary}`
                : `Aucun échange n'a eu lieu avant ce message.`,
            `Le Maître du jeu vient de dire : "${baseMessage.content}"`,
            `Réagis comme ${gamer.name} et reste cohérent avec sa personnalité. Limite ta réponse à trois phrases.
			Si ${gamer.name} n'aurait raisonnablement aucune réaction, réponds exactement par "__NO_REACT__".`,
        ].filter(Boolean)

        const prompt = promptSections.join('\n\n')
        const response = await this.runOllama(prompt)

        return response.trim()
    }

    async generateCoachReaction(input: CoachReactionInput): Promise<string> {
        const { game, gamers, conversation, baseMessage } = input

        const conversationSummary = this.buildConversationSummary(
            game,
            conversation,
        )

        const playersOverview = gamers.length
            ? gamers
                  .map((gamer) => `- ${gamer.name} : ${gamer.lore}`)
                  .join('\n')
            : null

        const promptSections = [
            `Tu es le coach narratif de la campagne "${game.name}".`,
            game.lore
                ? `Voici le contexte général du monde du jeu : ${game.lore}`
                : null,
            playersOverview
                ? `Voici les personnages joueurs impliqués :
${playersOverview}`
                : `Aucun personnage joueur n'est actuellement défini pour cette campagne.`,
            conversationSummary
                ? `Historique récent des échanges :
${conversationSummary}`
                : `Aucun échange récent n'est disponible.`,
            `Le Maître du jeu vient de déclarer : "${baseMessage.content}"`,
            `Analyse la situation et propose un conseil stratégique ou narratif. Si aucune intervention n'est nécessaire, réponds exactement "__NO_REACT__". Limite ta réponse à trois phrases.`,
        ].filter(Boolean)

        const prompt = promptSections.join('\n\n')
        const response = await this.runOllama(prompt)

        return response.trim()
    }

    async generateCoachMessage(input: CoachReactionInput): Promise<string> {
        const { game, gamers, conversation, baseMessage } = input

        const conversationSummary = this.buildConversationSummary(
            game,
            conversation,
        )

        const playersOverview = gamers.length
            ? gamers
                  .map((gamer) => `- ${gamer.name} : ${gamer.lore}`)
                  .join('\n')
            : null

        const promptSections = [
            `Tu es le coach narratif de la campagne "${game.name}".`,
            game.lore
                ? `Voici le contexte général du monde du jeu : ${game.lore}`
                : null,
            playersOverview
                ? `Voici les personnages joueurs impliqués : ${playersOverview}`
                : `Aucun personnage joueur n'est actuellement défini pour cette campagne.`,
            conversationSummary
                ? `Historique récent des échanges : ${conversationSummary}`
                : `Aucun échange récent n'est disponible.`,
            `Le Maître du jeu vient de te demander : "${baseMessage.content}"`,
            `Analyse la situation et réponds-lui. Limite ta réponse à trois phrases.`,
        ].filter(Boolean)

        const prompt = promptSections.join('\n\n')
        const response = await this.runOllama(prompt)

        return response.trim()
    }

    private describeStatistics(gamer: Gamer): string | null {
        if (!gamer.statistics || gamer.statistics.length === 0) {
            return null
        }

        return gamer.statistics
            .map((stat) => `${stat.name}: ${stat.value}`)
            .join(', ')
    }

    private buildConversationSummary(game: Game, conversation: Message[]) {
        if (!conversation.length) return ''

        const gamerNameById = new Map(
            (game.gamers || []).map((gamer) => [gamer.id, gamer.name]),
        )

        return conversation
            .slice(-12)
            .map((message) => {
                const normalizedSenderId = message.senderId?.startsWith('ai-')
                    ? message.senderId.slice(3)
                    : message.senderId

                const senderLabel = message.isCoaching
                    ? 'Coach'
                    : normalizedSenderId
                      ? gamerNameById.get(normalizedSenderId) ||
                        normalizedSenderId
                      : 'MJ'

                return `${senderLabel}: ${message.content}`
            })
            .join('\n')
    }

    private async runOllama(prompt: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = spawn('ollama', ['run', 'mistral'], {
                stdio: ['pipe', 'pipe', 'pipe'],
            })

            let output = ''
            let errorOutput = ''

            process.stdout.on('data', (data) => {
                output += data.toString()
            })

            process.stderr.on('data', (data) => {
                errorOutput += data.toString()
            })

            process.on('error', (error) => {
                reject(error)
            })

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output)
                } else {
                    reject(
                        new InternalServerErrorException(
                            errorOutput.trim() ||
                                `ollama exited with code ${code}`,
                        ),
                    )
                }
            })

            process.stdin.write(prompt)
            process.stdin.end()
        })
    }
}
