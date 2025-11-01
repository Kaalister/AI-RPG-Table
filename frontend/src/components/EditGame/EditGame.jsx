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
            statisticTypes: game?.statisticTypes || [],
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

    handleAddStatisticRow() {
        this.setState((prevState) => ({
            statisticTypes: [...prevState.statisticTypes, { name: '' }],
        }))
    }

    handleRemoveStatisticRow(index) {
        this.setState((prevState) => ({
            statisticTypes: prevState.statisticTypes.filter(
                (_, i) => i !== index,
            ),
        }))
    }

    handleStatisticTypesFieldChange(index, field, value) {
        this.setState((prevState) => {
            const updatedStatisticTypes = prevState.statisticTypes.map(
                (statistic, i) => {
                    if (i === index) return { ...statistic, [field]: value }
                    return statistic
                },
            )
            return { statisticTypes: updatedStatisticTypes }
        })
    }

    async handleSubmit(event) {
        event.preventDefault()

        const { game, onSaved } = this.props
        const { name, lore, statisticTypes } = this.state
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

        const trimmedStatisticTypes = statisticTypes.map((stat) => ({
            name: stat.name.trim(),
        }))

        if (trimmedStatisticTypes.some((stat) => !stat.name)) {
            this.setState({
                error: 'Chaque statistique doit avoir un nom valide.',
                success: null,
            })
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
                        statisticTypes: trimmedStatisticTypes,
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
        const { name, lore, statisticTypes, submitting, error } = this.state
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

                    <div className="new-game-statistics">
                        <div className="new-game-statistics-header">
                            <span>Statistiques</span>
                            <button
                                type="button"
                                className="new-game-tertiary-button"
                                onClick={() => this.handleAddStatisticRow()}
                                disabled={isSubmitting}
                            >
                                + Ajouter une statistique
                            </button>
                        </div>

                        {statisticTypes.length === 0 && (
                            <p className="new-game-statistics-empty">
                                Ajoutez des attributs comme la Force ou le Mana
                                pour cette partie.
                            </p>
                        )}

                        {statisticTypes.map((statistic, statisticIndex) => (
                            <div
                                key={statisticIndex}
                                className="new-game-statistics-row"
                            >
                                <label className="new-game-field">
                                    <span>Nom</span>
                                    <input
                                        className="new-game-input"
                                        value={statistic.name}
                                        onChange={(event) =>
                                            this.handleStatisticTypesFieldChange(
                                                statisticIndex,
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Force, Mana, Initiative…"
                                        maxLength={50}
                                        disabled={isSubmitting}
                                    />
                                </label>

                                <button
                                    type="button"
                                    className="new-game-tertiary-button new-game-remove-statistic"
                                    onClick={() =>
                                        this.handleRemoveStatisticRow(
                                            statisticIndex,
                                        )
                                    }
                                    disabled={isSubmitting}
                                >
                                    Retirer
                                </button>
                            </div>
                        ))}
                    </div>

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
