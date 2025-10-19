import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const handleResponse = async (response) => {
    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Une erreur est survenue côté serveur.')
    }

    return response.json()
}

const channelKey = (gameId, channel) => `${gameId || 'unknown'}:${channel}`

export const fetchMessagesByGame = createAsyncThunk(
    'messages/fetchByGame',
    async (gameId, { rejectWithValue }) => {
        if (!gameId) {
            return rejectWithValue('Aucune partie sélectionnée.')
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/messages/${gameId}`,
            )

            return { gameId, messages: await handleResponse(response) }
        } catch (error) {
            return rejectWithValue(
                error.message || 'Erreur lors du chargement des messages.',
            )
        }
    },
)

export const sendMessageToGame = createAsyncThunk(
    'messages/sendToGame',
    async ({ gameId, content, senderId, isCoaching }, { rejectWithValue }) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_URL_API}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content,
                        gameId,
                        senderId,
                        isCoaching,
                    }),
                },
            )

            return { gameId, message: await handleResponse(response) }
        } catch (error) {
            return rejectWithValue(
                error.message || "Erreur lors de l'envoi du message.",
            )
        }
    },
)

const initialState = {
    messagesByGame: {},
    fetchStatusByGame: {},
    fetchErrorByGame: {},
    sendStatusByChannel: {},
    sendError: null,
    aiStatusByChannel: {},
    aiError: null,
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        clearMessagesError(state) {
            state.sendError = null
            state.aiError = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMessagesByGame.pending, (state, action) => {
                const gameId = action.meta.arg
                state.fetchStatusByGame[gameId] = 'loading'
                state.fetchErrorByGame[gameId] = null
            })
            .addCase(fetchMessagesByGame.fulfilled, (state, action) => {
                const { gameId, messages } = action.payload
                state.fetchStatusByGame[gameId] = 'succeeded'
                state.messagesByGame[gameId] = messages
            })
            .addCase(fetchMessagesByGame.rejected, (state, action) => {
                const gameId = action.meta.arg
                state.fetchStatusByGame[gameId] = 'failed'
                state.fetchErrorByGame[gameId] =
                    action.payload || 'Impossible de charger les messages.'
            })
            .addCase(sendMessageToGame.pending, (state, action) => {
                const { gameId, senderId } = action.meta.arg
                state.sendStatusByChannel[channelKey(gameId, senderId)] =
                    'loading'
                state.sendError = null
            })
            .addCase(sendMessageToGame.fulfilled, (state, action) => {
                const { gameId, message } = action.payload
                const senderId =
                    message?.senderId || action.meta.arg?.senderId || 'player'
                if (!state.messagesByGame[gameId]) {
                    state.messagesByGame[gameId] = []
                }
                state.messagesByGame[gameId] = [
                    ...state.messagesByGame[gameId],
                    message,
                ]
                state.sendStatusByChannel[channelKey(gameId, senderId)] =
                    'succeeded'
            })
            .addCase(sendMessageToGame.rejected, (state, action) => {
                const { gameId, senderId } = action.meta.arg
                state.sendStatusByChannel[channelKey(gameId, senderId)] =
                    'failed'
                state.sendError =
                    action.payload || "Impossible d'envoyer le message."
            })
    },
})

export const { clearMessagesError } = messagesSlice.actions

export default messagesSlice.reducer

export const selectMessagesForGame = (state, gameId) =>
    state.messages.messagesByGame[gameId] || []

export const selectMessagesForChannel = (state, gameId, isCoaching) => {
    const messages = selectMessagesForGame(state, gameId)
    if (!messages.length) return []

    return messages.filter((message) => isCoaching === message.isCoaching)
}

export const selectMessagesFetchStatus = (state, gameId) =>
    state.messages.fetchStatusByGame[gameId] || 'idle'

export const selectSendStatusForChannel = (state, gameId, isCoaching) =>
    state.messages.sendStatusByChannel[channelKey(gameId, isCoaching)] || 'idle'

export const selectAiStatusForChannel = (state, gameId, isCoaching) =>
    state.messages.aiStatusByChannel[channelKey(gameId, isCoaching)] || 'idle'

export const selectMessagesError = (state, gameId) =>
    state.messages.fetchErrorByGame[gameId] || null

export const selectSendError = (state) => state.messages.sendError

export const selectAiError = (state) => state.messages.aiError
