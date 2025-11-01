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

        const profileDescription = this.describeGamerProfile(gamer)
        const competencesOverview = this.describeCompetences(gamer)
        const statsDescription = this.describeStatistics(gamer)
        const conversationSummary = this.buildConversationSummary(
            game,
            conversation,
        )

        const promptSections = [
            `Tu es **${gamer.name}**, un personnage joueur dans une partie de jeu de rôle (JDR). 
  Tu dois penser, parler et agir comme ${gamer.name}, sans jamais sortir de ton rôle ni commenter ton statut d'intelligence artificielle.`,

            profileDescription
                ? `Profil détaillé : ${profileDescription}`
                : null,

            competencesOverview
                ? `Compétences et spécialisations actuelles : ${competencesOverview}`
                : null,

            game.lore
                ? `Contexte de la campagne **"${game.name}"** : ${game.lore}`
                : `Tu participes à la campagne **"${game.name}"**. Aucun contexte additionnel n'est fourni.`,

            statsDescription
                ? `Tes caractéristiques actuelles sont : ${statsDescription}. Tiens-en compte dans tes décisions et réactions.`
                : null,

            conversationSummary
                ? `Résumé des derniers échanges entre les participants : ${conversationSummary}`
                : `Aucun échange n’a eu lieu avant ce message.`,

            `Le Maître du jeu dit : "${baseMessage.content}"`,

            `Ta mission :
  - Réagis **comme ${gamer.name} le ferait** dans cette situation, selon sa personnalité, ses objectifs et ses émotions.
    - Tiens compte de ton apparence, de ta personnalité et de ton vécu dans chaque réaction.
  - Parle à la **première personne**, comme si tu étais vraiment ce personnage (par ex. : "Je m'avance prudemment vers la porte.").
  - Reste dans le ton narratif du JDR : immersif, cohérent, et centré sur l'action, les pensées ou les paroles de ton personnage.
  - Ne décris pas ce que fait le MJ ou les autres joueurs.
  - Ne génère **aucun méta-commentaire**, explication ou justification hors-jeu.
  - Limite ta réponse à **trois phrases maximum**.
  - Si ${gamer.name} n’aurait **aucune réaction crédible ou utile** dans cette scène, réponds **exactement** par "__NO_REACT__".`,
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

        const playersOverview = this.buildPlayersOverview(gamers)

        const promptSections = [
            `Tu es le **coach narratif** de la campagne **"${game.name}"**. 
  Ton rôle est d’aider le Maître du jeu à maintenir la cohérence, le rythme et la profondeur narrative de la partie. 
  Tu observes les échanges entre les personnages sans intervenir directement dans l’histoire.`,

            game.lore
                ? `Contexte général du monde : ${game.lore}`
                : `Aucun contexte additionnel n'est disponible.`,

            playersOverview
                ? `Personnages joueurs actuellement impliqués :
${playersOverview}`
                : `Aucun personnage joueur n'est actuellement défini pour cette campagne.`,

            conversationSummary
                ? `Historique récent des échanges :
${conversationSummary}`
                : `Aucun échange récent n’est disponible.`,

            `Le Maître du jeu vient de déclarer : "${baseMessage.content}"`,

            `Ta mission :
  - Analyse la situation sous l’angle **narratif, stratégique et logique** : cohérence du ton, du rythme, des émotions, et des interactions.
  - Signale tout **anachronisme**, **incohérence temporelle**, ou **erreur de logique** par rapport à la période, au contexte ou au lore de la campagne.
  - Si une **intervention** te semble utile (par ex. suggestion d’ajustement, rappel de cohérence, opportunité dramatique à exploiter), formule-la clairement.
  - Si tout te semble fluide et cohérent, réponds **exactement** par "__NO_REACT__".
  - Ta réponse doit être **courte (3 phrases maximum)**, **pertinente**, et **centrée sur l’aide au Maître du jeu**, sans jamais décrire d’actions ni parler à la place des personnages.`,
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

        const playersOverview = this.buildPlayersOverview(gamers)

        const promptSections = [
            `Tu es le **coach narratif** de la campagne **"${game.name}"**. 
  Ton rôle est de fournir des conseils narratifs et stratégiques au Maître du jeu, pour enrichir la cohérence, le rythme et la profondeur du scénario.`,

            game.lore
                ? `Contexte général du monde : ${game.lore}`
                : `Aucun contexte additionnel n'est disponible.`,

            playersOverview
                ? `Personnages joueurs actuellement impliqués :
${playersOverview}`
                : `Aucun personnage joueur n'est actuellement défini pour cette campagne.`,

            conversationSummary
                ? `Historique récent des échanges :
${conversationSummary}`
                : `Aucun échange récent n’est disponible.`,

            `Le Maître du jeu te demande : "${baseMessage.content}"`,

            `Réponds-lui de manière **claire, concise et experte** (3 phrases maximum). 
  Ta réponse doit aider à **prendre une décision narrative ou stratégique**, sans jamais jouer à la place des personnages ni briser la cohérence du monde.`,
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
            .map((stat) => `${stat.statisticType.name}: ${stat.value}`)
            .join(', ')
    }

    private describeGamerProfile(gamer: Gamer): string | null {
        const segments: string[] = []

        if (gamer.age !== undefined && gamer.age !== null) {
            segments.push(`Âge: ${gamer.age} ans`)
        }

        if (gamer.physical_description) {
            segments.push(`Description physique: ${gamer.physical_description}`)
        }

        if (gamer.personality) {
            segments.push(`Personnalité: ${gamer.personality}`)
        }

        if (gamer.lore) {
            segments.push(`Histoire: ${gamer.lore}`)
        }

        return segments.length ? segments.join(' ; ') : null
    }

    private describeCompetences(gamer: Gamer): string | null {
        const generalCompetences = gamer.competences?.length
            ? gamer.competences
                  .map(
                      (competence) =>
                          `${competence.name} (${competence.value})`,
                  )
                  .join(', ')
            : null

        const combatCompetences = gamer.fighting_competences?.length
            ? gamer.fighting_competences
                  .map(
                      (competence) =>
                          `${competence.name} (${competence.value})`,
                  )
                  .join(', ')
            : null

        const segments: string[] = []

        if (generalCompetences) {
            segments.push(`Compétences générales: ${generalCompetences}`)
        }

        if (combatCompetences) {
            segments.push(`Compétences martiales: ${combatCompetences}`)
        }

        return segments.length ? segments.join(' ; ') : null
    }

    private buildPlayersOverview(gamers: Gamer[]): string | null {
        if (!gamers.length) {
            return null
        }

        return gamers
            .map((gamer) => {
                const profile = this.describeGamerProfile(gamer)
                const competences = this.describeCompetences(gamer)
                const stats = this.describeStatistics(gamer)

                const details = [
                    profile,
                    competences,
                    stats ? `Stats: ${stats}` : null,
                ]
                    .filter(Boolean)
                    .join(' | ')

                return details
                    ? `- ${gamer.name} : ${details}`
                    : `- ${gamer.name}`
            })
            .join('\n')
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
