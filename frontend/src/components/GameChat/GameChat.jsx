import React from 'react'
import './GameChat.css'
import { connect } from 'react-redux'
import Chat from '../Chat/Chat.jsx'
import { selectSelectedGame } from '../../store/gamesSlice'

class GameChat extends React.Component {
    constructor(props) {
        super(props)
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
                <Chat />
                <Chat IsGameMasterChat />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    selectedGame: selectSelectedGame(state),
})

export default connect(mapStateToProps)(GameChat)
