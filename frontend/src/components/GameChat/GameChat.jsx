import React from 'react'
import './GameChat.css'
import { connect } from 'react-redux'
import Chat from '../Chat/Chat.jsx'
import {
    fetchGames,
    selectGamesStatus,
    selectSelectedGame,
    selectSelectedGameId,
    setSelectedGame,
} from '../../store/gamesSlice'
import {
    subscribeToMessages,
    disconnectMessagesSocket,
} from '../../store/messagesSlice'

class GameChat extends React.Component {
    componentDidMount() {
        this.ensureGamesLoaded()
        this.ensureSelectedGame()
        this.ensureMessagesSubscription()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.status !== this.props.status) {
            this.ensureGamesLoaded()
        }

        if (
            prevProps.selectedGame !== this.props.selectedGame ||
            prevProps.selectedGameId !== this.props.selectedGameId ||
            prevProps.status !== this.props.status
        ) {
            this.ensureSelectedGame()
        }

        if (prevProps.selectedGame?.id !== this.props.selectedGame?.id) {
            this.ensureMessagesSubscription(prevProps)
        }
    }

    componentWillUnmount() {
        this.props.disconnectMessagesSocket()
    }

    ensureGamesLoaded() {
        const { status, fetchGames } = this.props

        if (status === 'idle') {
            fetchGames()
        }
    }

    ensureSelectedGame() {
        const { selectedGame, selectedGameId, status, setSelectedGame } =
            this.props

        if (!selectedGame && selectedGameId && status === 'succeeded') {
            setSelectedGame(selectedGameId)
        }
    }

    ensureMessagesSubscription(prevProps = {}) {
        const previousGameId = prevProps?.selectedGame?.id
        const currentGameId = this.props.selectedGame?.id

        if (currentGameId && previousGameId !== currentGameId) {
            this.props.subscribeToMessages(currentGameId)
        }

        if (!currentGameId && previousGameId) {
            this.props.disconnectMessagesSocket()
        }
    }

    render() {
        const { selectedGame } = this.props

        if (!selectedGame) {
            return (
                <div className="game-chat-placeholder">
                    Sélectionnez une partie pour afficher le chat.
                </div>
            )
        }

        return (
            <div className="game-chat">
                <Chat gameId={selectedGame.id} />
                <Chat gameId={selectedGame.id} IsGameMasterChat />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    selectedGame: selectSelectedGame(state),
    selectedGameId: selectSelectedGameId(state),
    status: selectGamesStatus(state),
})

const mapDispatchToProps = {
    fetchGames,
    setSelectedGame,
    subscribeToMessages,
    disconnectMessagesSocket,
}

export default connect(mapStateToProps, mapDispatchToProps)(GameChat)
