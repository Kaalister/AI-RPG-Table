import React from 'react'
import { connect } from 'react-redux'
import './NewGame.css'
import {
    addGamersToGame,
    createGame,
    selectCreateGameStatus,
    selectUpdateGameStatus,
} from '../../store/gamesSlice'

const createEmptyStatisticType = () => ({
    name: '',
})

const createEmptyStatistic = () => ({
    name: '',
    value: '',
})

const createInitialCreateForm = () => ({
    name: '',
    lore: '',
    statisticTypes: [],
})

const createEmptyGamerForm = (getStatisticFromStatisticTypes) => ({
    name: '',
    color:
        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
    age: '',
    lore: '',
    physical_description: '',
    personality: '',
    statistics: getStatisticFromStatisticTypes
        ? getStatisticFromStatisticTypes()
        : [],
    competences: [],
    fighting_competences: [],
})

const createInitialState = () => ({
    phase: 'CREATE', // 'CREATE' | 'PLAYERS'
    createForm: createInitialCreateForm(),
    gamerForms: [createEmptyGamerForm(() => {})],
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
        this.getStatisticFromStatisticTypes =
            this.getStatisticFromStatisticTypes.bind(this)
    }

    resetState(callback) {
        this.setState(createInitialState(), callback)
    }

    getStatisticFromStatisticTypes(currentGame) {
        return (currentGame?.statisticTypes || []).map((statType) => ({
            statisticType: statType,
            value: '',
        }))
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
        const trimmedStatisticTypes = (createForm.statisticTypes || []).map(
            (stat) => ({
                name: stat.name.trim(),
            }),
        )

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

        if (trimmedStatisticTypes.some((stat) => !stat.name)) {
            this.setState({
                error: 'Chaque statistique doit avoir un nom valide.',
                success: null,
            })
            return
        }

        this.setState({ submitting: true, error: null, success: null })

        try {
            const createdGame = await this.props
                .createGame({
                    name: trimmedName,
                    lore: trimmedLore,
                    statisticTypes: trimmedStatisticTypes,
                })
                .unwrap()

            this.setState({
                createdGame,
                phase: 'PLAYERS',
                submitting: false,
                success:
                    'Partie créée avec succès ! Ajoutez maintenant vos joueurs.',
                gamerForms: [
                    createEmptyGamerForm(() =>
                        this.getStatisticFromStatisticTypes(createdGame),
                    ),
                ],
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

    handleStatisticFieldChange(gamerIndex, statisticIndex, value) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) => {
                if (idx !== gamerIndex) return gamer

                const statistics = gamer.statistics || []
                const sanitizedValue = value.replace(/[^0-9.,\-]/g, '')

                const updatedStatistics = statistics.map((stat, statIdx) =>
                    statIdx === statisticIndex
                        ? {
                              ...stat,
                              value: sanitizedValue,
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

    handleStatisticTypesFieldChange(statisticIndex, name, field) {
        this.setState((prevState) => {
            const createForm = prevState.createForm

            createForm.statisticTypes[statisticIndex] = {
                [name]: field,
            }

            return {
                createForm,
                error: null,
                success: null,
            }
        })
    }

    handleAddStatisticRow() {
        this.setState((prevState) => ({
            createForm: {
                ...prevState.createForm,
                statisticTypes: [
                    ...(prevState.createForm.statisticTypes || []),
                    createEmptyStatisticType(),
                ],
            },
            error: null,
            success: null,
        }))
    }

    handleAddCompetenceRow(gamerIndex, competenceField) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) => {
                if (idx !== gamerIndex) return gamer

                const competences = gamer[competenceField] || []

                return {
                    ...gamer,
                    [competenceField]: [...competences, createEmptyStatistic()],
                }
            })

            return {
                gamerForms,
                error: null,
                success: null,
            }
        })
    }

    handleRemoveStatisticRow(statisticIndex) {
        this.setState((prevState) => ({
            createForm: {
                ...prevState.createForm,
                statisticTypes: prevState.createForm.statisticTypes.filter(
                    (_, idx) => idx !== statisticIndex,
                ),
            },
        }))
    }

    handleCompetenceChange(
        gamerIndex,
        competenceIndex,
        gamerField,
        field,
        value,
    ) {
        this.setState((prevState) => {
            const gamerForms = prevState.gamerForms.map((gamer, idx) => {
                if (idx !== gamerIndex) return gamer

                const competences = gamer[gamerField] || []

                const updatedCompetences = competences.map((comp, compIdx) =>
                    compIdx === competenceIndex
                        ? {
                              ...comp,
                              // Sanitize value to allow only numbers, commas, dots and minus sign
                              [field]:
                                  field === 'value'
                                      ? value.replace(/[^0-9.,\-]/g, '')
                                      : value,
                          }
                        : comp,
                )

                return {
                    ...gamer,
                    [gamerField]: updatedCompetences,
                }
            })

            return {
                gamerForms,
                error: null,
                success: null,
            }
        })
    }

    handleAddGamerRow() {
        const { createdGame } = this.state

        this.setState((prevState) => ({
            gamerForms: [
                ...prevState.gamerForms,
                createEmptyGamerForm(() =>
                    this.getStatisticFromStatisticTypes(createdGame),
                ),
            ],
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

    hasValidList(sanitizedGamers, gamerForms, field) {
        return sanitizedGamers.some((gamer, index) => {
            const competences = gamerForms[index][field] || []

            return competences.some((comp) => {
                console.log(comp)

                const rawValue = String(comp.value ?? '').trim()

                if (comp.name.trim() === '') return true
                if (rawValue === '') return false

                const numericValue = Number(rawValue.replace(',', '.'))

                return rawValue === '' || Number.isNaN(numericValue)
            })
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
                const value = String(stat.value ?? '').trim()
                return value !== '' && stat.statisticType.id
            })

            const competences = (gamer.competences || []).filter((comp) => {
                const value = String(comp.value ?? '').trim()
                return comp.name.trim() !== '' && value !== ''
            })

            const fighting_competences = (
                gamer.fighting_competences || []
            ).filter((comp) => {
                const value = String(comp.value ?? '').trim()
                return value !== ''
            })

            const sanitizedStatistics = statistics.map((stat) => ({
                statisticType: stat.statisticType,
                value: Number(String(stat.value ?? '').replace(',', '.')),
            }))

            const sanitizedCompetences = competences.map((comp) => ({
                name: comp.name.trim(),
                value: Number(String(comp.value ?? '').replace(',', '.')),
            }))

            const sanitizedFightingCompetences = fighting_competences.map(
                (comp) => ({
                    name: comp.name.trim(),
                    value: Number(String(comp.value ?? '').replace(',', '.')),
                }),
            )

            return {
                name: gamer.name.trim(),
                color: gamer.color.trim(),
                lore: gamer.lore.trim(),
                physical_description: gamer.physical_description.trim(),
                personality: gamer.personality.trim(),
                age: gamer.age ? Number(gamer.age) : NaN,
                statistics: sanitizedStatistics,
                competences: sanitizedCompetences,
                fighting_competences: sanitizedFightingCompetences,
            }
        })

        const hasInvalidGamer = sanitizedGamers.some(
            (gamer) =>
                !gamer.name ||
                !gamer.color ||
                !gamer.lore ||
                !gamer.physical_description ||
                !gamer.personality ||
                Number.isNaN(gamer.age) ||
                gamer.age <= 0,
        )

        const hasInvalidStats = sanitizedGamers.some((gamer, index) => {
            const statistics = gamerForms[index].statistics || []

            return statistics.some((stat) => {
                const rawValue = String(stat.value ?? '').trim()

                if (rawValue === '') return false

                const numericValue = Number(rawValue.replace(',', '.'))

                return rawValue === '' || Number.isNaN(numericValue)
            })
        })

        if (
            hasInvalidGamer ||
            hasInvalidStats ||
            this.hasValidList(sanitizedGamers, gamerForms, 'competences') ||
            this.hasValidList(
                sanitizedGamers,
                gamerForms,
                'fighting_competences',
            )
        ) {
            this.setState({
                error: 'Chaque joueur doit avoir un nom, une couleur, un âge positif, un lore et des statistiques valides.',
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
                competences:
                    gamer.competences && gamer.competences.length > 0
                        ? gamer.competences
                        : undefined,
                fighting_competences:
                    gamer.fighting_competences &&
                    gamer.fighting_competences.length > 0
                        ? gamer.fighting_competences
                        : undefined,
            }))

            console.log({
                gameId: createdGame.id,
                gamers: payload,
            })

            const updatedGame = await this.props
                .addGamersToGame({
                    gameId: createdGame.id,
                    gamers: payload,
                })
                .unwrap()

            if (typeof this.props.onCreated === 'function')
                this.props.onCreated(updatedGame)

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

                        {(createForm.statisticTypes || []).length === 0 && (
                            <p className="new-game-statistics-empty">
                                Ajoutez des attributs comme la Force ou le Mana
                                pour cette partie.
                            </p>
                        )}

                        {(createForm.statisticTypes || []).map(
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
                            ),
                        )}
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
                                <span>Description physique</span>
                                <textarea
                                    className="new-game-input new-game-textarea-small"
                                    value={gamer.physical_description}
                                    onChange={(event) =>
                                        this.handleGamerFieldChange(
                                            index,
                                            'physical_description',
                                            event.target.value,
                                        )
                                    }
                                    rows={2}
                                    maxLength={100}
                                    placeholder="Décrivez l'apparence physique du personnage."
                                    disabled={isSubmitting}
                                />
                            </label>

                            <label className="new-game-field">
                                <span>Traits de personnalité du joueur</span>
                                <textarea
                                    className="new-game-input new-game-textarea-small"
                                    value={gamer.personality}
                                    onChange={(event) =>
                                        this.handleGamerFieldChange(
                                            index,
                                            'personality',
                                            event.target.value,
                                        )
                                    }
                                    rows={2}
                                    maxLength={100}
                                    placeholder="Décrivez les traits de caractère du personnage."
                                    disabled={isSubmitting}
                                />
                            </label>

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
                                <span>Stats du joueur</span>
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
                                                    value={
                                                        statistic.statisticType
                                                            .name
                                                    }
                                                    disabled
                                                    maxLength={50}
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
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="10"
                                                    maxLength={6}
                                                    disabled={isSubmitting}
                                                    inputMode="decimal"
                                                />
                                            </label>
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="new-game-statistics">
                                <div className="new-game-statistics-header">
                                    <span>Compétences de combat du joueur</span>
                                    <button
                                        type="button"
                                        className="new-game-tertiary-button"
                                        onClick={() =>
                                            this.handleAddCompetenceRow(
                                                index,
                                                'fighting_competences',
                                            )
                                        }
                                        disabled={isSubmitting}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                                {(gamer.fighting_competences || []).map(
                                    (fc, statisticIndex) => (
                                        <div
                                            key={statisticIndex}
                                            className="new-game-statistics-row"
                                        >
                                            <label className="new-game-field">
                                                <span>Nom</span>
                                                <input
                                                    className="new-game-input"
                                                    value={fc.name}
                                                    maxLength={50}
                                                    onChange={(event) =>
                                                        this.handleCompetenceChange(
                                                            index,
                                                            statisticIndex,
                                                            'fighting_competences',
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="new-game-field">
                                                <span>Valeur</span>
                                                <input
                                                    className="new-game-input"
                                                    value={fc.value}
                                                    onChange={(event) =>
                                                        this.handleCompetenceChange(
                                                            index,
                                                            statisticIndex,
                                                            'fighting_competences',
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

                            <div className="new-game-statistics">
                                <div className="new-game-statistics-header">
                                    <span>Compétences du joueur</span>
                                    <button
                                        type="button"
                                        className="new-game-tertiary-button"
                                        onClick={() =>
                                            this.handleAddCompetenceRow(
                                                index,
                                                'competences',
                                            )
                                        }
                                        disabled={isSubmitting}
                                    >
                                        + Ajouter
                                    </button>
                                </div>
                                {(gamer.competences || []).map(
                                    (competence, statisticIndex) => (
                                        <div
                                            key={statisticIndex}
                                            className="new-game-statistics-row"
                                        >
                                            <label className="new-game-field">
                                                <span>Nom</span>
                                                <input
                                                    className="new-game-input"
                                                    value={competence.name}
                                                    maxLength={50}
                                                    onChange={(event) =>
                                                        this.handleCompetenceChange(
                                                            index,
                                                            statisticIndex,
                                                            'competences',
                                                            'name',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label className="new-game-field">
                                                <span>Valeur</span>
                                                <input
                                                    className="new-game-input"
                                                    value={competence.value}
                                                    onChange={(event) =>
                                                        this.handleCompetenceChange(
                                                            index,
                                                            statisticIndex,
                                                            'competences',
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
