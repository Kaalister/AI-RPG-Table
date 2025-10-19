import React from 'react'
import { connect } from 'react-redux'
import '../NewGame/NewGame.css'
import {
    addGamersToGame,
    updateGamerInGame,
    deleteGamerFromGame,
    selectUpdateGameStatus,
} from '../../store/gamesSlice'
import TrashIcon from '../Icons/TrashIcon'

const createEmptyStatistic = () => ({
    name: '',
    value: '',
})

const createEmptyGamerForm = () => ({
    id: undefined,
    name: '',
    color: '',
    age: '',
    lore: '',
    statistics: [],
})

class ManagePlayers extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            gamerForm: createEmptyGamerForm(),
            submitting: false,
            error: null,
            success: null,
        }

        this.handleGamerFieldChange = this.handleGamerFieldChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleAddStatisticRow = this.handleAddStatisticRow.bind(this)
        this.handleRemoveStatisticRow = this.handleRemoveStatisticRow.bind(this)
        this.handleStatisticFieldChange =
            this.handleStatisticFieldChange.bind(this)
        this.handleEditPlayer = this.handleEditPlayer.bind(this)
        this.handleDeletePlayer = this.handleDeletePlayer.bind(this)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.game?.id !== this.props.game?.id) {
            this.setState({
                gamerForm: createEmptyGamerForm(),
                submitting: false,
                error: null,
                success: null,
            })
        }
    }

    handleGamerFieldChange(field, value) {
        this.setState((prevState) => {
            const gamerForm = { ...prevState.gamerForm }
            gamerForm[field] =
                field === 'age' ? value.replace(/[^0-9]/g, '') : value

            return {
                gamerForm,
                error: null,
                success: null,
            }
        })
    }

    handleStatisticFieldChange(statisticIndex, field, value) {
        this.setState((prevState) => {
            const gamerForm = { ...prevState.gamerForm }
            const statistics = gamerForm.statistics || []
            const sanitizedValue =
                field === 'value' ? value.replace(/[^0-9.,\-]/g, '') : value

            const updatedStatistics = statistics.map((stat, statIdx) =>
                statIdx === statisticIndex
                    ? {
                          ...stat,
                          [field]: sanitizedValue,
                      }
                    : stat,
            )

            gamerForm.statistics = updatedStatistics

            return {
                gamerForm,
                error: null,
                success: null,
            }
        })
    }

    handleAddStatisticRow() {
        this.setState((prevState) => {
            const gamerForm = { ...prevState.gamerForm }

            const updatedStatistics = [
                ...(gamerForm.statistics || []),
                createEmptyStatistic(),
            ]

            gamerForm.statistics = updatedStatistics

            return { gamerForm }
        })
    }

    handleRemoveStatisticRow(statisticIndex) {
        this.setState((prevState) => {
            const gamerForm = { ...prevState.gamerForm }

            gamerForm.statistics = (gamerForm.statistics || []).filter(
                (_, statIdx) => statIdx !== statisticIndex,
            )

            return { gamerForm }
        })
    }

    handleEditPlayer(gamerId) {
        const { gamers } = this.props.game || []
        const { gamerForm } = this.state
        const gamerToEdit = gamers.find((gamer) => gamer.id === gamerId)

        if (!gamerToEdit) return

        if (gamerForm.id === gamerToEdit.id)
            this.setState({ gamerForm: createEmptyGamerForm() })
        else this.setState({ gamerForm: { ...gamerToEdit } })
    }

    async handleDeletePlayer(event, gamerId) {
        event.stopPropagation()

        const { game } = this.props

        if (!game) {
            return
        }

        this.setState({ submitting: true, error: null })

        try {
            await this.props
                .deleteGamerFromGame({ gameId: game.id, gamerId })
                .unwrap()

            this.setState((prevState) => ({
                submitting: false,
                gamerForm:
                    prevState.gamerForm.id === gamerId
                        ? createEmptyGamerForm()
                        : prevState.gamerForm,
            }))
        } catch (error) {
            this.setState({
                submitting: false,
                error:
                    error?.message ||
                    'Impossible de supprimer le joueur pour le moment.',
            })
        }
    }

    async handleSubmit(event) {
        event.preventDefault()

        const { game } = this.props
        const { gamerForm } = this.state

        if (!game) {
            this.setState({
                error: 'Aucune partie sélectionnée pour ajouter des joueurs.',
            })
            return
        }

        if (
            !gamerForm.name ||
            !gamerForm.color ||
            !gamerForm.lore ||
            Number.isNaN(gamerForm.age) ||
            gamerForm.age <= 0 ||
            (gamerForm.statistics || []).some(
                (stat) => Number.isNaN(stat.value) || stat.name === '',
            )
        ) {
            this.setState({
                error: 'Le joueur doit avoir un nom, une couleur, un âge, un lore et des statistiques valides.',
            })
            return
        }

        try {
            this.setState({ submitting: true, error: null })

            if (gamerForm.id) {
                await this.props
                    .updateGamerInGame({
                        gameId: game.id,
                        gamer: gamerForm,
                    })
                    .unwrap()
            } else {
                await this.props
                    .addGamersToGame({
                        gameId: game.id,
                        gamer: gamerForm,
                    })
                    .unwrap()
            }
        } catch (error) {
            this.setState({
                error:
                    error?.message ||
                    "Impossible d'enregistrer le joueur pour le moment.",
            })
        } finally {
            this.setState({
                submitting: false,
                gamerForm: createEmptyGamerForm(),
            })
        }
    }

    handleCancel() {
        const { onCancel } = this.props
        if (typeof onCancel === 'function') {
            onCancel()
        }
    }

    renderExistingGamers() {
        const { game, updateStatus } = this.props
        const existingGamers = game?.gamers || []
        const isBusy = this.state.submitting || updateStatus === 'loading'
        const activeGamerId = this.state.gamerForm?.id

        if (existingGamers.length === 0) return null

        return (
            <div className="new-game-gamer-card">
                <h3 className="new-game-existing-title">
                    Joueurs déjà enregistrés
                </h3>
                <ul className="new-game-existing-list">
                    {existingGamers.map((gamer) => {
                        const isActive = activeGamerId === gamer.id

                        return (
                            <li
                                key={gamer.id}
                                className={`new-game-existing-item${
                                    isActive
                                        ? ' new-game-existing-item-active'
                                        : ''
                                }`}
                            >
                                <button
                                    type="button"
                                    className={`new-game-existing-select${
                                        isActive
                                            ? ' new-game-existing-select-active'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        this.handleEditPlayer(gamer.id)
                                    }
                                    disabled={isBusy}
                                >
                                    <span
                                        className="new-game-existing-dot"
                                        style={{
                                            backgroundColor: gamer.color,
                                        }}
                                    />
                                    <strong style={{ color: gamer.color }}>
                                        {gamer.name}
                                    </strong>
                                </button>
                                <button
                                    type="button"
                                    className="new-game-existing-delete"
                                    onClick={(event) =>
                                        this.handleDeletePlayer(event, gamer.id)
                                    }
                                    disabled={isBusy}
                                    aria-label={`Supprimer ${gamer.name}`}
                                >
                                    <TrashIcon />
                                </button>
                            </li>
                        )
                    })}
                </ul>
                <p className="new-game-existing-hint">
                    Les joueurs ajoutés ci-dessous viendront compléter cette
                    liste.
                </p>
            </div>
        )
    }

    render() {
        const { gamerForm, submitting, error } = this.state
        const { updateStatus, game } = this.props
        const isSubmitting = submitting || updateStatus === 'loading'

        return (
            <div className="new-game-card">
                <header className="new-game-header">
                    <div>
                        <h2>Modifier les joueurs</h2>
                        <p>
                            {`Modifier les joueurs pour la partie « ${game?.name} ».`}
                        </p>
                    </div>
                </header>

                {this.renderExistingGamers()}

                <form className="new-game-form" onSubmit={this.handleSubmit}>
                    <div className="new-game-gamer-card">
                        <div className="new-game-gamer-grid">
                            <label className="new-game-field">
                                <span>Nom</span>
                                <input
                                    className="new-game-input"
                                    value={gamerForm.name}
                                    onChange={(event) =>
                                        this.handleGamerFieldChange(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Nom du joueur"
                                    maxLength={60}
                                    disabled={isSubmitting}
                                />
                            </label>

                            <label className="new-game-field">
                                <span>Couleur</span>
                                <div
                                    className="new-game-color-input-wrapper"
                                    style={{
                                        backgroundColor: gamerForm.color,
                                    }}
                                >
                                    <input
                                        className="new-game-input-color"
                                        type="color"
                                        value={gamerForm.color}
                                        onChange={(event) =>
                                            this.handleGamerFieldChange(
                                                'color',
                                                event.target.value,
                                            )
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </label>

                            <label className="new-game-field">
                                <span>Âge</span>
                                <input
                                    className="new-game-input"
                                    value={gamerForm.age}
                                    onChange={(event) =>
                                        this.handleGamerFieldChange(
                                            'age',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="28"
                                    maxLength={3}
                                    disabled={isSubmitting}
                                    inputMode="numeric"
                                />
                            </label>
                        </div>

                        <label className="new-game-field">
                            <span>Lore du joueur</span>
                            <textarea
                                className="new-game-input new-game-textarea"
                                value={gamerForm.lore}
                                onChange={(event) =>
                                    this.handleGamerFieldChange(
                                        'lore',
                                        event.target.value,
                                    )
                                }
                                rows={4}
                                maxLength={600}
                                placeholder="Décrivez l'histoire ou la motivation du personnage."
                                disabled={isSubmitting}
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

                            {(gamerForm.statistics || []).length === 0 && (
                                <p className="new-game-statistics-empty">
                                    Ajoutez des attributs comme la Force ou le
                                    Mana pour ce joueur.
                                </p>
                            )}

                            {(gamerForm.statistics || []).map(
                                (statistic, statisticIndex) => (
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
                                                    this.handleStatisticFieldChange(
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

                                        <label className="new-game-field">
                                            <span>Valeur</span>
                                            <input
                                                className="new-game-input"
                                                value={statistic.value}
                                                onChange={(event) =>
                                                    this.handleStatisticFieldChange(
                                                        statisticIndex,
                                                        'value',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="10"
                                                maxLength={6}
                                                disabled={isSubmitting}
                                                inputMode="decimal"
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
                                ),
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="new-game-message new-game-message-error">
                            {error}
                        </div>
                    )}

                    <div className="new-game-actions">
                        <button
                            type="submit"
                            className="new-game-primary-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Enregistrement…'
                                : 'Enregistrer le joueur'}
                        </button>

                        <button
                            type="button"
                            className="new-game-secondary-button"
                            onClick={this.handleCancel}
                            disabled={isSubmitting}
                        >
                            Retour
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    updateStatus: selectUpdateGameStatus(state),
})

const mapDispatchToProps = {
    addGamersToGame,
    updateGamerInGame,
    deleteGamerFromGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(ManagePlayers)
