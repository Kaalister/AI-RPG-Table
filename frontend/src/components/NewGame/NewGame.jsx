import React from 'react'
import { connect } from 'react-redux'
import './NewGame.css'
import {
    addGamersToGame,
    createGame,
    selectCreateGameStatus,
    selectUpdateGameStatus,
} from '../../store/gamesSlice'

const createInitialCreateForm = () => ({
    name: '',
    lore: '',
})

const createEmptyStatistic = () => ({
    name: '',
    value: '',
})

const createEmptyGamerForm = () => ({
    name: '',
    color:
        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
    age: '',
    lore: '',
    statistics: [],
})

const createInitialState = () => ({
    phase: 'CREATE',
    createForm: createInitialCreateForm(),
    gamerForms: [createEmptyGamerForm()],
    createdGame: null,
    submitting: false,
    error: null,
    success: null,
})

class NewGame extends React.Component {
    constructor(props) {
        super(props)

        this.state = createInitialState()

        this.handleCreateFieldChange = this.handleCreateFieldChange.bind(this)
        this.handleSubmitCreate = this.handleSubmitCreate.bind(this)
        this.handleCancel = this.handleCancel.bind(this)
        this.handleGamerFieldChange = this.handleGamerFieldChange.bind(this)
        this.handleAddGamerRow = this.handleAddGamerRow.bind(this)
        this.handleRemoveGamerRow = this.handleRemoveGamerRow.bind(this)
        this.handleSubmitGamers = this.handleSubmitGamers.bind(this)
        this.handleSkipGamers = this.handleSkipGamers.bind(this)
        this.handleStatisticFieldChange =
            this.handleStatisticFieldChange.bind(this)
        this.handleAddStatisticRow = this.handleAddStatisticRow.bind(this)
        this.handleRemoveStatisticRow = this.handleRemoveStatisticRow.bind(this)
    }

    resetState(callback) {
        this.setState(createInitialState(), callback)
    }

    handleCreateFieldChange(event) {
        const { name, value } = event.target

        this.setState((prevState) => ({
            createForm: {
                ...prevState.createForm,
                [name]: value,
            },
            error: null,
            success: null,
        }))
    }

    async handleSubmitCreate(event) {
        event.preventDefault()

        const { createForm } = this.state
        const trimmedName = createForm.name.trim()
        const trimmedLore = createForm.lore.trim()

        if (!trimmedName) {
            this.setState({
                error: 'Le nom de la partie est obligatoire.',
                success: null,
            })
            return
        }

        if (!trimmedLore) {
            this.setState({
                error: 'Veuillez décrire le lore initial de la partie.',
                success: null,
            })
            return
        }

        this.setState({ submitting: true, error: null, success: null })

        try {
            const createdGame = await this.props
                .createGame({ name: trimmedName, lore: trimmedLore })
                .unwrap()

            this.setState({
                createdGame,
                phase: 'PLAYERS',
                submitting: false,
                success:
                    'Partie créée avec succès ! Ajoutez maintenant vos joueurs.',
                gamerForms: [createEmptyGamerForm()],
            })
        } catch (creationError) {
            this.setState({
                error:
                    creationError?.message ||
                    'Une erreur est survenue pendant la création de la partie.',
            })
        } finally {
            this.setState({ submitting: false })
        }
    }

    handleGamerFieldChange(index, field, value) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) =>
                idx === index
                    ? {
                          ...gamer,
                          [field]:
                              field === 'age'
                                  ? value.replace(/[^0-9]/g, '')
                                  : value,
                      }
                    : gamer,
            )

            return {
                gamerForms,
                error: null,
                success: null,
            }
        })
    }

    handleStatisticFieldChange(gamerIndex, statisticIndex, field, value) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) => {
                if (idx !== gamerIndex) {
                    return gamer
                }

                const statistics = gamer.statistics || []
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

                return {
                    ...gamer,
                    statistics: updatedStatistics,
                }
            })

            return {
                gamerForms,
                error: null,
                success: null,
            }
        })
    }

    handleAddStatisticRow(gamerIndex) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) =>
                idx === gamerIndex
                    ? {
                          ...gamer,
                          statistics: [
                              ...(gamer.statistics || []),
                              createEmptyStatistic(),
                          ],
                      }
                    : gamer,
            )

            return { gamerForms }
        })
    }

    handleRemoveStatisticRow(gamerIndex, statisticIndex) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) => {
                if (idx !== gamerIndex) {
                    return gamer
                }

                const statistics = gamer.statistics || []
                const filtered = statistics.filter(
                    (_, statIdx) => statIdx !== statisticIndex,
                )

                return {
                    ...gamer,
                    statistics: filtered,
                }
            })

            return { gamerForms }
        })
    }

    handleAddGamerRow() {
        this.setState((prevState) => ({
            gamerForms: [...prevState.gamerForms, createEmptyGamerForm()],
        }))
    }

    handleRemoveGamerRow(index) {
        this.setState((prevState) => {
            if (prevState.gamerForms.length === 1) {
                return null
            }

            const gamerForms = prevState.gamerForms.filter(
                (_, idx) => idx !== index,
            )
            return { gamerForms }
        })
    }

    async handleSubmitGamers(event) {
        event.preventDefault()

        const { gamerForms, createdGame } = this.state

        if (!createdGame) {
            this.setState({
                error: 'Aucune partie sélectionnée pour ajouter des joueurs.',
            })
            return
        }

        const sanitizedGamers = gamerForms.map((gamer) => {
            const statistics = (gamer.statistics || []).filter((stat) => {
                const name = (stat.name || '').trim()
                const value = String(stat.value ?? '').trim()
                return name !== '' || value !== ''
            })

            const sanitizedStatistics = statistics.map((stat) => ({
                name: (stat.name || '').trim(),
                value: Number(String(stat.value ?? '').replace(',', '.')),
            }))

            return {
                name: gamer.name.trim(),
                color: gamer.color.trim(),
                lore: gamer.lore.trim(),
                age: gamer.age ? Number(gamer.age) : NaN,
                statistics: sanitizedStatistics,
            }
        })

        const hasInvalidGamer = sanitizedGamers.some(
            (gamer) =>
                !gamer.name ||
                !gamer.color ||
                !gamer.lore ||
                Number.isNaN(gamer.age) ||
                gamer.age <= 0,
        )

        const hasInvalidStatistics = sanitizedGamers.some((gamer, index) => {
            const stats = gamerForms[index].statistics || []

            return stats.some((stat, statIndex) => {
                const name = (stat.name || '').trim()
                const rawValue = String(stat.value ?? '').trim()

                if (name === '' && rawValue === '') {
                    return false
                }

                const numericValue = Number(rawValue.replace(',', '.'))

                return (
                    name === '' || rawValue === '' || Number.isNaN(numericValue)
                )
            })
        })

        if (hasInvalidGamer || hasInvalidStatistics) {
            this.setState({
                error: 'Chaque joueur doit avoir un nom, une couleur, un âge positif, un lore et des statistiques valides (nom + valeur numérique).',
                success: null,
            })
            return
        }

        this.setState({ submitting: true, error: null })

        try {
            const payload = sanitizedGamers.map((gamer) => ({
                ...gamer,
                statistics:
                    gamer.statistics && gamer.statistics.length > 0
                        ? gamer.statistics
                        : undefined,
            }))

            const updatedGame = await this.props
                .addGamersToGame({
                    gameId: createdGame.id,
                    gamers: payload,
                })
                .unwrap()

            if (typeof this.props.onCreated === 'function') {
                this.props.onCreated(updatedGame)
            }

            this.resetState()
        } catch (saveError) {
            this.setState({
                error:
                    saveError.message ||
                    'Une erreur est survenue pendant l’enregistrement des joueurs.',
            })
        } finally {
            this.setState({ submitting: false })
        }
    }

    handleSkipGamers() {
        const { createdGame } = this.state

        if (createdGame && typeof this.props.onCreated === 'function') {
            this.props.onCreated(createdGame)
        }

        this.resetState()
    }

    handleCancel() {
        this.resetState(() => {
            if (typeof this.props.onCancel === 'function') {
                this.props.onCancel()
            }
        })
    }

    renderCreateForm() {
        const { createForm, submitting, error } = this.state
        const { onCancel, createStatus } = this.props

        const isSubmitting = submitting || createStatus === 'loading'

        return (
            <>
                <header className="new-game-header">
                    <div>
                        <h2>Créer une nouvelle partie</h2>
                        <p>
                            Définissez l'univers de votre aventure, puis passez
                            à l’ajout des joueurs.
                        </p>
                    </div>
                </header>

                <form
                    className="new-game-form"
                    onSubmit={this.handleSubmitCreate}
                >
                    <label className="new-game-field">
                        <span>Nom de la partie</span>
                        <input
                            name="name"
                            className="new-game-input"
                            placeholder="Ex. Chroniques d'Arkanis"
                            value={createForm.name}
                            onChange={this.handleCreateFieldChange}
                            disabled={isSubmitting}
                            maxLength={80}
                        />
                    </label>

                    <label className="new-game-field">
                        <span>Lore initial</span>
                        <textarea
                            name="lore"
                            className="new-game-input new-game-textarea"
                            placeholder="Posez les bases de votre monde, vos factions ou vos quêtes."
                            value={createForm.lore}
                            onChange={this.handleCreateFieldChange}
                            disabled={isSubmitting}
                            rows={5}
                            maxLength={800}
                        />
                    </label>

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
                                ? 'Création en cours…'
                                : 'Créer la partie'}
                        </button>

                        {onCancel && (
                            <button
                                type="button"
                                className="new-game-secondary-button"
                                onClick={this.handleCancel}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </>
        )
    }

    renderGamersForm() {
        const { gamerForms, submitting, error, success, createdGame } =
            this.state
        const { updateStatus } = this.props

        const isSubmitting = submitting || updateStatus === 'loading'

        return (
            <>
                <header className="new-game-header">
                    <div>
                        <h2>Ajoutez vos joueurs</h2>
                        <p>
                            Enregistrez les membres de votre groupe pour la
                            partie « {createdGame?.name} ».
                        </p>
                    </div>
                </header>

                {(error || success) && (
                    <div
                        className={`new-game-message ${
                            error
                                ? 'new-game-message-error'
                                : 'new-game-message-success'
                        }`}
                    >
                        {error || success}
                    </div>
                )}

                <form
                    className="new-game-form"
                    onSubmit={this.handleSubmitGamers}
                >
                    {gamerForms.map((gamer, index) => (
                        <div key={index} className="new-game-gamer-card">
                            <div className="new-game-gamer-grid">
                                <label className="new-game-field">
                                    <span>Nom</span>
                                    <input
                                        className="new-game-input"
                                        value={gamer.name}
                                        onChange={(event) =>
                                            this.handleGamerFieldChange(
                                                index,
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Lyra la Stratège"
                                        maxLength={60}
                                        disabled={isSubmitting}
                                    />
                                </label>

                                <label className="new-game-field">
                                    <span>Couleur</span>

                                    <div
                                        className="new-game-color-input-wrapper"
                                        style={{
                                            backgroundColor: gamer.color,
                                        }}
                                    >
                                        <input
                                            className="new-game-input-color"
                                            type="color"
                                            value={gamer.color}
                                            onChange={(event) =>
                                                this.handleGamerFieldChange(
                                                    index,
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
                                        value={gamer.age}
                                        onChange={(event) =>
                                            this.handleGamerFieldChange(
                                                index,
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
                                    value={gamer.lore}
                                    onChange={(event) =>
                                        this.handleGamerFieldChange(
                                            index,
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
                                        onClick={() =>
                                            this.handleAddStatisticRow(index)
                                        }
                                        disabled={isSubmitting}
                                    >
                                        + Ajouter une statistique
                                    </button>
                                </div>

                                {(gamer.statistics || []).length === 0 && (
                                    <p className="new-game-statistics-empty">
                                        Ajoutez des attributs comme la Force ou
                                        le Mana pour ce joueur.
                                    </p>
                                )}

                                {(gamer.statistics || []).map(
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
                                                            index,
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
                                                            index,
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
                                                        index,
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

                            {this.state.gamerForms.length > 1 && (
                                <div className="new-game-gamer-actions">
                                    <button
                                        type="button"
                                        className="new-game-secondary-button"
                                        onClick={() =>
                                            this.handleRemoveGamerRow(index)
                                        }
                                        disabled={isSubmitting}
                                    >
                                        Retirer ce joueur
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        className="new-game-secondary-button new-game-add-gamer"
                        onClick={this.handleAddGamerRow}
                        disabled={isSubmitting}
                    >
                        + Ajouter un joueur
                    </button>

                    <div className="new-game-actions">
                        <button
                            type="submit"
                            className="new-game-primary-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Enregistrement…'
                                : 'Enregistrer les joueurs'}
                        </button>

                        <button
                            type="button"
                            className="new-game-secondary-button"
                            onClick={this.handleSkipGamers}
                            disabled={isSubmitting}
                        >
                            Passer cette étape
                        </button>
                    </div>
                </form>
            </>
        )
    }

    render() {
        const { phase } = this.state

        return (
            <div className="new-game-card">
                {phase === 'CREATE'
                    ? this.renderCreateForm()
                    : this.renderGamersForm()}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    createStatus: selectCreateGameStatus(state),
    updateStatus: selectUpdateGameStatus(state),
})

const mapDispatchToProps = {
    createGame,
    addGamersToGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(NewGame)
