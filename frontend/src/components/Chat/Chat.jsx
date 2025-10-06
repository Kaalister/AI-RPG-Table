import React from 'react'
import './Chat.css'

export default class Chat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            messages: [],
            input: '',
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSend = this.handleSend.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    handleInputChange(event) {
        this.setState({ input: event.target.value })
    }

    handleSend() {
        const nextMessage = this.state.input.trim()
        if (!nextMessage) {
            return
        }

        this.setState((prevState) => ({
            messages: [
                ...prevState.messages,
                { id: Date.now(), text: nextMessage },
            ],
            input: '',
        }))
    }

    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            this.handleSend()
        }
    }

    render() {
        const { IsGameMasterChat } = this.props

        return (
            <section
                className="app-section chat-section"
                style={{ flex: IsGameMasterChat ? 1 : 2 }}
            >
                <h1>{IsGameMasterChat ? 'Chat Coach' : 'Chat du Jeu'}</h1>
                <div className="chat-window">
                    {!this.state.messages.length ? (
                        <div className="chat-empty">
                            Pas encore de messages — commencez votre histoire
                            ci-dessous.
                        </div>
                    ) : (
                        this.state.messages.map((msg) => (
                            <div key={msg.id} className="chat-message">
                                {msg.text}
                            </div>
                        ))
                    )}
                </div>
                <div className="chat-controls">
                    <input
                        type="text"
                        value={this.state.input}
                        onChange={this.handleInputChange}
                        onKeyDown={this.handleKeyDown}
                        placeholder="Share your next idea..."
                        className="chat-input"
                    />
                    <button
                        type="button"
                        className="primary-button"
                        onClick={this.handleSend}
                    >
                        Send
                    </button>
                </div>
            </section>
        )
    }
}
