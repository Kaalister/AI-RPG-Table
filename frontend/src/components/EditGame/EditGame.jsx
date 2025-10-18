import React from 'react'
import { connect } from 'react-redux'
import '../NewGame/NewGame.css'
import {
    updateGame,
    selectUpdateGameStatus,
    selectUpdateGameError,
} from '../../store/gamesSlice'

class EditGame extends React.Component {
    constructor(props) {
        super(props)

        const { game } = this.props

        this.state = {
            name: game?.name || '',
            lore: game?.lore || '',
            submitting: false,
            error: null,
        }

        this.handleChange = this.handleChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.game?.id !== this.props.game?.id) {
            this.setState({
                name: this.props.game?.name || '',
                lore: this.props.game?.lore || '',
                error: null,
                submitting: false,
            })
        }
    }

    handleChange(event) {
        const { name, value } = event.target
        this.setState({ [name]: value, error: null })
    }

    async handleSubmit(event) {
        event.preventDefault()

        const { game, onSaved } = this.props
        const { name, lore } = this.state
        const trimmedName = name.trim()
        const trimmedLore = lore.trim()

        if (!trimmedName) {
            this.setState({ error: 'Le nom de la partie est obligatoire.' })
            return
        }

        if (!trimmedLore) {
            this.setState({ error: 'Le lore ne peut pas être vide.' })
            return
        }

        this.setState({ submitting: true, error: null })

        try {
            const updatedGame = await this.props
                .updateGame({
                    gameId: game.id,
                    data: {
                        name: trimmedName,
                        lore: trimmedLore,
                    },
                })
                .unwrap()

            if (typeof onSaved === 'function') {
                onSaved(updatedGame)
            }
        } catch (error) {
            this.setState({
                error:
                    error?.message ||
                    'Impossible de mettre à jour la partie pour le moment.',
            })
        } finally {
            this.setState({ submitting: false })
        }
    }

    handleCancel() {
        const { onCancel } = this.props

        if (typeof onCancel === 'function') {
            onCancel()
        }
    }

    render() {
        const { name, lore, submitting, error } = this.state
        const { updateStatus, updateError } = this.props
        const isSubmitting = submitting || updateStatus === 'loading'
        const displayError =
            error || (updateError && !isSubmitting ? updateError : null)

        return (
            <div className="new-game-card">
                <header className="new-game-header">
                    <div>
                        <h2>Modifier la partie</h2>
                        <p>
                            Ajustez le nom et le lore de votre campagne avant de
                            revenir à la liste.
                        </p>
                    </div>
                </header>

                <form className="new-game-form" onSubmit={this.handleSubmit}>
                    <label className="new-game-field">
                        <span>Nom de la partie</span>
                        <input
                            name="name"
                            className="new-game-input"
                            placeholder="Nom de la partie"
                            value={name}
                            onChange={this.handleChange}
                            disabled={isSubmitting}
                            maxLength={80}
                        />
                    </label>

                    <label className="new-game-field">
                        <span>Lore</span>
                        <textarea
                            name="lore"
                            className="new-game-input new-game-textarea"
                            placeholder="Décrivez l'univers de votre partie."
                            value={lore}
                            onChange={this.handleChange}
                            disabled={isSubmitting}
                            rows={5}
                            maxLength={800}
                        />
                    </label>

                    {displayError && (
                        <div className="new-game-message new-game-message-error">
                            {displayError}
                        </div>
                    )}

                    <div className="new-game-actions">
                        <button
                            type="submit"
                            className="new-game-primary-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Mise à jour…'
                                : 'Enregistrer les modifications'}
                        </button>

                        <button
                            type="button"
                            className="new-game-secondary-button"
                            onClick={this.handleCancel}
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    updateStatus: selectUpdateGameStatus(state),
    updateError: selectUpdateGameError(state),
})

const mapDispatchToProps = {
    updateGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditGame)
