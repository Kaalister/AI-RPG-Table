import React from 'react'
import './Settings.css'

export default class Settings extends React.Component {
    render() {
        return (
            <section className="app-section settings-section">
                <h1>Settings</h1>
                <p>
                    Configure campaign preferences, AI difficulty, and
                    notification options. Additional configuration panes will
                    appear here as the project evolves.
                </p>
            </section>
        )
    }
}
