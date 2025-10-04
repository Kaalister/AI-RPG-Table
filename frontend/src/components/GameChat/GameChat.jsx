import React from "react";
import "./GameChat.css";

export default class GameChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      input: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleInputChange(event) {
    this.setState({ input: event.target.value });
  }

  handleSend() {
    const nextMessage = this.state.input.trim();
    if (!nextMessage) {
      return;
    }

    this.setState((prevState) => ({
      messages: [...prevState.messages, { id: Date.now(), text: nextMessage }],
      input: "",
    }));
  }

  handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

  render() {
    return (
      <section className="app-section">
        <h1>GameChat</h1>
        <div className="chat-window">
          {this.state.messages.length === 0 ? (
            <div className="chat-empty">
              No messages yet — start your story below.
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
    );
  }
}
