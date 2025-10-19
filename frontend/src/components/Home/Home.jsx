import React from 'react'
import { connect } from 'react-redux'
import './Home.css'
import NewGame from '../NewGame/NewGame'
import EditGame from '../EditGame/EditGame'
import ManagePlayers from '../ManagePlayers/ManagePlayers'
import {
    fetchGames,
    deleteGame,
    selectGames,
    selectGamesError,
    selectGamesStatus,
    selectSelectedGame,
    selectDeleteGameStatus,
    selectDeleteGameError,
    setSelectedGame,
} from '../../store/gamesSlice'

class Home extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            createNewGame: false,
            expandedLoreGameId: null,
            editingGameId: null,
            managingPlayersGameId: null,
            deletingGameId: null,
            actionError: null,
        }

        this.openNewGame = this.openNewGame.bind(this)
        this.closeNewGame = this.closeNewGame.bind(this)
        this.handleGameCreated = this.handleGameCreated.bind(this)
        this.handleSelectGame = this.handleSelectGame.bind(this)
        this.reloadGames = this.reloadGames.bind(this)
        this.toggleLoreVisibility = this.toggleLoreVisibility.bind(this)
        this.openEditGame = this.openEditGame.bind(this)
        this.closeEditGame = this.closeEditGame.bind(this)
        this.handleGameUpdated = this.handleGameUpdated.bind(this)
        this.openManagePlayers = this.openManagePlayers.bind(this)
        this.closeManagePlayers = this.closeManagePlayers.bind(this)
        this.handleDeleteGame = this.handleDeleteGame.bind(this)
    }

    componentDidMount() {
        if (this.props.status === 'idle') this.props.fetchGames()
    }

    openNewGame() {
        this.setState({
            createNewGame: true,
            editingGameId: null,
            managingPlayersGameId: null,
            actionError: null,
        })
    }

    closeNewGame() {
        this.setState({ createNewGame: false })
    }

    handleGameCreated(game) {
        this.setState({ createNewGame: false, actionError: null })

        if (game && game.id) this.props.setSelectedGame(game.id)
    }

    handleSelectGame(gameId) {
        const selectedGame = this.props.selectedGame

        if (selectedGame && selectedGame.id === gameId) {
            this.props.setSelectedGame(null)
        } else {
            this.props.setSelectedGame(gameId)
        }
    }

    openEditGame(event, gameId) {
        event.stopPropagation()

        this.setState({
            editingGameId: gameId,
            managingPlayersGameId: null,
            createNewGame: false,
            actionError: null,
        })
    }

    closeEditGame() {
        this.setState({ editingGameId: null })
    }

    handleGameUpdated(updatedGame) {
        this.setState({ editingGameId: null, actionError: null })

        if (updatedGame && updatedGame.id)
            this.props.setSelectedGame(updatedGame.id)
    }

    openManagePlayers(event, gameId) {
        event.stopPropagation()

        this.setState({
            managingPlayersGameId: gameId,
            editingGameId: null,
            createNewGame: false,
            actionError: null,
        })
    }

    closeManagePlayers() {
        this.setState({ managingPlayersGameId: null })
    }

    async handleDeleteGame(event, gameId) {
        event.stopPropagation()

        const { deletingGameId } = this.state

        if (deletingGameId) {
            return
        }

        const confirmed = window.confirm(
            'Êtes-vous sûr de vouloir supprimer cette partie ? Cette action est irréversible.',
        )

        if (!confirmed) {
            return
        }

        this.setState({ deletingGameId: gameId, actionError: null })

        try {
            await this.props.deleteGame(gameId).unwrap()

            this.setState((prevState) => ({
                deletingGameId: null,
                editingGameId:
                    prevState.editingGameId === gameId
                        ? null
                        : prevState.editingGameId,
                managingPlayersGameId:
                    prevState.managingPlayersGameId === gameId
                        ? null
                        : prevState.managingPlayersGameId,
                createNewGame: false,
                expandedLoreGameId:
                    prevState.expandedLoreGameId === gameId
                        ? null
                        : prevState.expandedLoreGameId,
            }))
        } catch (error) {
            this.setState({
                deletingGameId: null,
                actionError:
                    error?.message ||
                    'Impossible de supprimer la partie pour le moment.',
            })
        }
    }

    toggleLoreVisibility(event, gameId) {
        event.stopPropagation()

        this.setState((prevState) => ({
            expandedLoreGameId:
                prevState.expandedLoreGameId === gameId ? null : gameId,
        }))
    }

    reloadGames() {
        this.setState({ actionError: null })
        this.props.fetchGames()
    }

    renderGamesOverview() {
        const {
            games,
            status,
            error,
            selectedGame,
            deleteStatus,
            deleteError,
        } = this.props
        const { actionError, deletingGameId } = this.state

        const isLoading = status === 'loading'
        const combinedActionError = actionError || deleteError

        if (isLoading && games.length === 0)
            return (
                <div className="home-helper-text">
                    Chargement des parties en cours…
                </div>
            )

        if (error)
            return (
                <div className="home-helper-text home-helper-error">
                    {error}
                </div>
            )

        if (games.length === 0)
            return (
                <div className="home-empty-state">
                    <h2>Pas encore de parties</h2>
                    <p>
                        Créez votre première partie pour commencer votre
                        campagne. Vous pourrez ensuite y inviter vos joueurs et
                        garder une trace de vos sessions.
                    </p>
                </div>
            )

        return (
            <div className="home-games">
                <div className="home-games-header">
                    <h2>Vos parties</h2>
                    <button
                        type="button"
                        className="home-refresh-button"
                        onClick={this.reloadGames}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Actualisation…' : 'Actualiser'}
                    </button>
                </div>
                {combinedActionError && (
                    <div className="home-helper-text home-helper-error">
                        {combinedActionError}
                    </div>
                )}
                <ul className="home-games-list">
                    {games.map((game) => {
                        const isSelected = selectedGame?.id === game.id
                        const isLoreExpanded =
                            this.state.expandedLoreGameId === game.id
                        const isDeleting = deletingGameId === game.id
                        return (
                            <li
                                key={game.id}
                                className={`home-game-card ${
                                    isSelected ? 'home-game-card-selected' : ''
                                }`}
                                onClick={() => this.handleSelectGame(game.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault()
                                        this.handleSelectGame(game.id)
                                    }
                                }}
                            >
                                <h3>{game.name}</h3>
                                {game.lore ? (
                                    <div className="home-game-lore">
                                        <p
                                            className={`home-game-lore-preview ${
                                                isLoreExpanded
                                                    ? 'home-game-lore-expanded'
                                                    : ''
                                            }`}
                                        >
                                            {game.lore}
                                        </p>
                                        <button
                                            type="button"
                                            className="home-game-lore-toggle"
                                            onClick={(event) =>
                                                this.toggleLoreVisibility(
                                                    event,
                                                    game.id,
                                                )
                                            }
                                        >
                                            {isLoreExpanded
                                                ? 'Masquer le lore'
                                                : 'Lire le lore'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="home-game-placeholder">
                                        Aucune description pour le moment.
                                    </p>
                                )}
                                <div className="home-game-actions">
                                    <button
                                        type="button"
                                        className="home-game-action-button"
                                        onClick={(event) =>
                                            this.openEditGame(event, game.id)
                                        }
                                    >
                                        Modifier
                                    </button>
                                    <button
                                        type="button"
                                        className="home-game-action-button"
                                        onClick={(event) =>
                                            this.openManagePlayers(
                                                event,
                                                game.id,
                                            )
                                        }
                                    >
                                        Modifier les joueurs
                                    </button>
                                    <button
                                        type="button"
                                        className="home-game-action-button home-game-action-danger"
                                        onClick={(event) =>
                                            this.handleDeleteGame(
                                                event,
                                                game.id,
                                            )
                                        }
                                        disabled={
                                            isDeleting ||
                                            deleteStatus === 'loading'
                                        }
                                    >
                                        {isDeleting
                                            ? 'Suppression…'
                                            : 'Supprimer'}
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

    render() {
        const { createNewGame, editingGameId, managingPlayersGameId } =
            this.state
        const { games } = this.props

        if (createNewGame) {
            return (
                <section className="app-section home-section">
                    <NewGame
                        onCreated={this.handleGameCreated}
                        onCancel={this.closeNewGame}
                    />
                </section>
            )
        }

        if (editingGameId) {
            const gameToEdit = games.find((game) => game.id === editingGameId)

            if (gameToEdit) {
                return (
                    <section className="app-section home-section">
                        <EditGame
                            game={gameToEdit}
                            onSaved={this.handleGameUpdated}
                            onCancel={this.closeEditGame}
                        />
                    </section>
                )
            }
        }

        if (managingPlayersGameId) {
            const gameForPlayers = games.find(
                (game) => game.id === managingPlayersGameId,
            )

            if (gameForPlayers) {
                return (
                    <section className="app-section home-section">
                        <ManagePlayers
                            game={gameForPlayers}
                            onCancel={this.closeManagePlayers}
                        />
                    </section>
                )
            }
        }

        return (
            <section className="app-section home-section">
                <div className="home-hero">
                    <div className="home-hero-text">
                        <h1>Bienvenue dans AI RPG Table</h1>
                        <p>
                            Donnez vie à vos récits de jeu de rôle sur table
                            grâce à des rencontres guidées par l&apos;IA.
                            Utilisez le GameChat pour collaborer avec votre
                            groupe, suivre les paramètres de la campagne et
                            faire évoluer vos aventures en temps réel.
                        </p>
                        <p>
                            Rejoignez le GameChat pour lancer une nouvelle
                            conversation ou rendez-vous dans les Paramètres pour
                            ajuster votre expérience.
                        </p>
                    </div>
                    <div className="home-hero-actions">
                        <button
                            onClick={this.openNewGame}
                            className="home-new-game-button"
                        >
                            Nouvelle Partie
                        </button>
                    </div>
                </div>

                {this.renderGamesOverview()}
            </section>
        )
    }
}

const mapStateToProps = (state) => ({
    games: selectGames(state),
    status: selectGamesStatus(state),
    error: selectGamesError(state),
    selectedGame: selectSelectedGame(state),
    deleteStatus: selectDeleteGameStatus(state),
    deleteError: selectDeleteGameError(state),
})

const mapDispatchToProps = {
    fetchGames,
    deleteGame,
    setSelectedGame,
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
