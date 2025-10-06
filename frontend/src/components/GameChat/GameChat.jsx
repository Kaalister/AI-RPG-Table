import React from 'react'
import './GameChat.css'
import Chat from '../Chat/Chat.jsx'

export default class GameChat extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="game-chat">
                <Chat />
                <Chat IsGameMasterChat />
            </div>
        )
    }
}
