import React from 'react'
import { connect } from 'react-redux'
import './Chat.css'
import {
    fetchMessagesByGame,
    selectAiError,
    selectAiStatusForChannel,
    selectMessagesError,
    selectMessagesFetchStatus,
    selectMessagesForChannel,
    selectSendError,
    selectSendStatusForChannel,
    selectSocketError,
    sendMessageToGame,
} from '../../store/messagesSlice'
import { selectSelectedGame } from '../../store/gamesSlice'

class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            input: '',
            localError: null,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.loadMessages = this.loadMessages.bind(this)
        this.lastFetchedGameId = null
    }

    componentDidMount() {
        this.loadMessages()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.gameId !== this.props.gameId) this.loadMessages()

        if (
            this.props.fetchStatus === 'failed' &&
            prevProps.fetchStatus !== 'failed'
        )
            this.lastFetchedGameId = null
    }

    loadMessages() {
        const { gameId } = this.props
        if (!gameId || this.lastFetchedGameId === gameId) return

        this.props.fetchMessagesByGame(gameId)
        this.lastFetchedGameId = gameId
    }

    handleInputChange(event) {
        this.setState({ input: event.target.value })
    }

    async handleSend() {
        const nextMessage = this.state.input.trim()
        const { gameId } = this.props
        if (!nextMessage) return

        if (!gameId) {
            this.setState({
                localError: 'Aucune partie sélectionnée pour ce chat.',
            })
            return
        }

        try {
            this.setState({
                localError: null,
                input: '',
            })
            await this.props
                .sendMessageToGame({
                    gameId,
                    content: nextMessage,
                    senderId: 'MJ',
                    isCoaching: !!this.props.IsGameMasterChat,
                })
                .unwrap()
        } catch (error) {
            this.setState({
                localError:
                    error?.message ||
                    "Impossible d'envoyer le message pour le moment.",
            })
        }
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.handleSend()
        }
    }

    render() {
        const {
            IsGameMasterChat,
            messages,
            sendStatus,
            aiStatus,
            fetchStatus,
            sendError,
            aiError,
            fetchError,
            socketError,
            selectedGame,
        } = this.props

        const { localError, input } = this.state
        const isSending = sendStatus === 'loading'
        const isThinking = aiStatus === 'loading'
        const placeholder = IsGameMasterChat
            ? 'Demandez un conseil au coach…'
            : 'Racontez la prochaine étape aux joueurs…'

        const composedError =
            localError ||
            sendError ||
            aiError ||
            fetchError ||
            socketError ||
            null

        return (
            <section
                className="app-section chat-section"
                style={{ flex: IsGameMasterChat ? 1 : 2 }}
            >
                <h1>{IsGameMasterChat ? 'Chat Coach' : 'Chat du Jeu'}</h1>
                <div className="chat-window">
                    {fetchStatus === 'loading' ? (
                        <div className="chat-empty">Chargement…</div>
                    ) : !messages.length ? (
                        <div className="chat-empty">
                            Pas encore de messages — commencez votre histoire
                            ci-dessous.
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const sender = msg.senderId
                            const isAiMessage = msg.senderId !== 'MJ'
                            const isMjMessage = msg.senderId === 'MJ'
                            const messageClass = `chat-message chat-message-${
                                isAiMessage ? 'ai' : isMjMessage ? 'mj' : sender
                            }`
                            let gamer =
                                msg.senderId !== 'MJ'
                                    ? selectedGame?.gamers?.find(
                                          (g) => g.id === msg.senderId,
                                      )
                                    : null

                            return (
                                <div
                                    key={msg.id || `message-${index}`}
                                    className={messageClass}
                                    style={{
                                        backgroundColor:
                                            `${gamer?.color}70` || '',
                                        borderColor: gamer?.color || '',
                                    }}
                                >
                                    <div className="chat-message-name">
                                        {gamer?.name}{' '}
                                        {msg.senderId === 'ai-coach' && 'Coach'}
                                    </div>
                                    {msg.content || msg.text}
                                </div>
                            )
                        })
                    )}

                    {isThinking && (
                        <div className="chat-loading">
                            <div className="chat-loading-spinner" />
                            <span>Les joueurs réfléchissent…</span>
                        </div>
                    )}
                </div>

                {composedError && (
                    <div className="chat-error">{composedError}</div>
                )}

                <div className="chat-controls">
                    <input
                        type="text"
                        value={input}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder={placeholder}
                        className="chat-input"
                        disabled={isSending}
                    />
                    <button
                        type="button"
                        className="primary-button"
                        onClick={this.handleSend}
                        disabled={isSending || !input.trim()}
                    >
                        {isSending
                            ? 'Envoi…'
                            : isThinking
                            ? 'Réflexion…'
                            : 'Envoyer'}
                    </button>
                </div>
            </section>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const { gameId } = ownProps

    return {
        messages: selectMessagesForChannel(
            state,
            gameId,
            !!ownProps.IsGameMasterChat,
        ),
        fetchStatus: selectMessagesFetchStatus(state, gameId),
        sendStatus: selectSendStatusForChannel(
            state,
            gameId,
            !!ownProps.IsGameMasterChat,
        ),
        aiStatus: selectAiStatusForChannel(
            state,
            gameId,
            !!ownProps.IsGameMasterChat,
        ),
        fetchError: selectMessagesError(state, gameId),
        sendError: selectSendError(state),
        aiError: selectAiError(state),
        socketError: selectSocketError(state),
        selectedGame: selectSelectedGame(state),
    }
}

const mapDispatchToProps = {
    fetchMessagesByGame,
    sendMessageToGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
