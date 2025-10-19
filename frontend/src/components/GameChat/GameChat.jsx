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

class GameChat extends React.Component {
    componentDidMount() {
        this.ensureGamesLoaded()
        this.ensureSelectedGame()
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
}

export default connect(mapStateToProps, mapDispatchToProps)(GameChat)
