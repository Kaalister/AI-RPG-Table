import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const handleResponse = async (response) => {
    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Une erreur est survenue côté serveur.')
    }

    return response.json()
}

export const fetchGames = createAsyncThunk(
    'games/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/games`,
            )
            return await handleResponse(response)
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors du chargement des parties.',
            )
        }
    },
)

export const createGame = createAsyncThunk(
    'games/create',
    async ({ name, lore }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/games`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, lore }),
                },
            )

            return await handleResponse(response)
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors de la création de la partie.',
            )
        }
    },
)

export const addGamersToGame = createAsyncThunk(
    'games/addGamer',
    async ({ gameId, gamer }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/games/${gameId}/addGamer`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gamer),
                },
            )

            return await handleResponse(response)
        } catch (error) {
            return rejectWithValue(
                error.message || "Erreur lors de l'ajout du joueur.",
            )
        }
    },
)

export const updateGamerInGame = createAsyncThunk(
    'games/updateGamer',
    async ({ gameId, gamer }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/gamers/${gamer.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gamer),
                },
            )

            return await handleResponse(response)
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors de la mise à jour du joueur.',
            )
        }
    },
)

export const deleteGamerFromGame = createAsyncThunk(
    'games/deleteGamerFromGame',
    async ({ gameId, gamerId }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/gamers/${gamerId}`,
                {
                    method: 'DELETE',
                },
            )

            if (!response.ok) {
                const message = await response.text()
                throw new Error(
                    message ||
                        'Une erreur est survenue lors de la suppression du joueur.',
                )
            }

            return { gameId, gamerId }
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors de la suppression du joueur.',
            )
        }
    },
)

export const updateGame = createAsyncThunk(
    'games/update',
    async ({ gameId, data }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/games/${gameId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                },
            )

            return await handleResponse(response)
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors de la mise à jour de la partie.',
            )
        }
    },
)

export const deleteGame = createAsyncThunk(
    'games/delete',
    async (gameId, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/games/${gameId}`,
                {
                    method: 'DELETE',
                },
            )

            await handleResponse(response)

            return { gameId }
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors de la suppression de la partie.',
            )
        }
    },
)

const initialState = {
    items: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
    createError: null,
    updateStatus: 'idle',
    updateError: null,
    deleteStatus: 'idle',
    deleteError: null,
    selectedGame: null,
}

const gamesSlice = createSlice({
    name: 'games',
    initialState,
    reducers: {
        clearGamesError(state) {
            state.error = null
        },
        setSelectedGame(state, action) {
            const gameId = action.payload

            const foundGame =
                state.items.find((game) => game.id === gameId) || null
            state.selectedGame = foundGame
        },
        clearSelectedGame(state) {
            state.selectedGame = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGames.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchGames.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.items = action.payload

                if (state.selectedGame) {
                    const refreshedGame = state.items.find(
                        (game) => game.id === state.selectedGame.id,
                    )
                    state.selectedGame = refreshedGame || null
                }
            })
            .addCase(fetchGames.rejected, (state, action) => {
                state.status = 'failed'
                state.error =
                    action.payload || 'Impossible de récupérer les parties.'
            })
            .addCase(createGame.pending, (state) => {
                state.createStatus = 'loading'
                state.createError = null
            })
            .addCase(createGame.fulfilled, (state, action) => {
                state.createStatus = 'succeeded'
                state.items = [action.payload, ...state.items]
                state.selectedGame = action.payload
            })
            .addCase(createGame.rejected, (state, action) => {
                state.createStatus = 'failed'
                state.createError =
                    action.payload || 'Impossible de créer la partie.'
            })
            .addCase(addGamersToGame.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })
            .addCase(addGamersToGame.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const updatedGame = action.payload
                state.items = state.items.map((game) =>
                    game.id === updatedGame.id ? updatedGame : game,
                )
                state.selectedGame = updatedGame
            })
            .addCase(addGamersToGame.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError =
                    action.payload || "Impossible d'ajouter les joueurs."
            })
            .addCase(deleteGamerFromGame.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })
            .addCase(deleteGamerFromGame.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const { gameId, gamerId } = action.payload
                state.items = state.items.map((game) => {
                    if (game.id !== gameId) return game
                    return {
                        ...game,
                        gamers: (game.gamers || []).filter(
                            (gamer) => gamer.id !== gamerId,
                        ),
                    }
                })

                if (state.selectedGame?.id === gameId) {
                    state.selectedGame = {
                        ...state.selectedGame,
                        gamers: (state.selectedGame.gamers || []).filter(
                            (gamer) => gamer.id !== gamerId,
                        ),
                    }
                }
            })
            .addCase(deleteGamerFromGame.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError =
                    action.payload || 'Impossible de supprimer le joueur.'
            })
            .addCase(updateGame.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })
            .addCase(updateGame.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const updatedGame = action.payload
                state.items = state.items.map((game) =>
                    game.id === updatedGame.id ? updatedGame : game,
                )
                if (state.selectedGame?.id === updatedGame.id) {
                    state.selectedGame = updatedGame
                }
            })
            .addCase(updateGame.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError =
                    action.payload || 'Impossible de mettre à jour la partie.'
            })
            .addCase(deleteGame.pending, (state) => {
                state.deleteStatus = 'loading'
                state.deleteError = null
            })
            .addCase(deleteGame.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded'
                const { gameId } = action.payload
                state.items = state.items.filter((game) => game.id !== gameId)
                if (state.selectedGame?.id === gameId) {
                    state.selectedGame = null
                }
            })
            .addCase(deleteGame.rejected, (state, action) => {
                state.deleteStatus = 'failed'
                state.deleteError =
                    action.payload || 'Impossible de supprimer la partie.'
            })
            .addCase(updateGamerInGame.pending, (state) => {
                state.updateStatus = 'loading'
                state.updateError = null
            })
            .addCase(updateGamerInGame.fulfilled, (state, action) => {
                state.updateStatus = 'succeeded'
                const updatedGamer = action.payload
                state.items = state.items.map((game) => {
                    if (
                        !game.gamers ||
                        !game.gamers.find((g) => g.id === updatedGamer.id)
                    )
                        return game

                    return {
                        ...game,
                        gamers: game.gamers.map((gamer) =>
                            gamer.id === updatedGamer.id ? updatedGamer : gamer,
                        ),
                    }
                })
            })
            .addCase(updateGamerInGame.rejected, (state, action) => {
                state.updateStatus = 'failed'
                state.updateError =
                    action.payload || 'Impossible de mettre à jour le joueur.'
            })
    },
})

export const { clearGamesError, setSelectedGame, clearSelectedGame } =
    gamesSlice.actions

export default gamesSlice.reducer

export const selectGames = (state) => state.games.items
export const selectGamesStatus = (state) => state.games.status
export const selectGamesError = (state) => state.games.error
export const selectSelectedGame = (state) => state.games.selectedGame
export const selectCreateGameStatus = (state) => state.games.createStatus
export const selectCreateGameError = (state) => state.games.createError
export const selectUpdateGameStatus = (state) => state.games.updateStatus
export const selectUpdateGameError = (state) => state.games.updateError
export const selectDeleteGameStatus = (state) => state.games.deleteStatus
export const selectDeleteGameError = (state) => state.games.deleteError
export const selectUpdateGamerStatus = (state) => state.games.updateStatus
export const selectUpdateGamerError = (state) => state.games.updateError
