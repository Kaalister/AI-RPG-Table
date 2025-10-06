import React from 'react'
import './Home.css'
import NewGame from '../NewGame/NewGame'

export default class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            games: null,
            loading: false,
            error: null,
            createNewGame: false,
        }

        this.loadGames = this.loadGames.bind(this)
        this.createNewGame = this.createNewGame.bind(this)
        this.cancelNewGame = this.cancelNewGame.bind(this)
        this.handleGameCreated = this.handleGameCreated.bind(this)
    }

    componentDidMount() {
        this.loadGames()
    }

    async loadGames() {
        this.setState({ loading: true, error: null })

        try {
            const response = await fetch('http://localhost:3000/games')
            if (!response.ok) {
                throw new Error('Réponse invalide du serveur.')
            }

            const games = await response.json()
            this.setState({ games, loading: false })
        } catch (error) {
            this.setState({
                error: 'Impossible de récupérer les parties pour le moment.',
                loading: false,
            })
        }
    }

    createNewGame() {
        this.setState({ createNewGame: true })
    }

    cancelNewGame() {
        this.setState({ createNewGame: false })
    }

    handleGameCreated(game) {
        this.setState((prevState) => {
            const currentGames = Array.isArray(prevState.games)
                ? prevState.games
                : []

            return {
                games: [game, ...currentGames],
                createNewGame: false,
                error: null,
            }
        })
    }

    renderGamesOverview() {
        const { games, loading, error } = this.state

        if (loading && (!games || games.length === 0)) {
            return (
                <div className="home-helper-text">
                    Chargement des parties en cours…
                </div>
            )
        }

        if (error) {
            return (
                <div className="home-helper-text home-helper-error">
                    {error}
                </div>
            )
        }

        if (!games || games.length === 0) {
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
        }

        return (
            <div className="home-games">
                <h2>Vos parties</h2>
                <ul className="home-games-list">
                    {games.map((game) => (
                        <li key={game.id} className="home-game-card">
                            <h3>{game.name}</h3>
                            {game.lore ? (
                                <p>{game.lore}</p>
                            ) : (
                                <p className="home-game-placeholder">
                                    Aucune description pour le moment.
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    render() {
        const { createNewGame } = this.state

        if (createNewGame) {
            return (
                <section className="app-section home-section">
                    <NewGame
                        onCreated={this.handleGameCreated}
                        onCancel={this.cancelNewGame}
                    />
                </section>
            )
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
                            onClick={this.createNewGame}
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
