import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { io } from 'socket.io-client'

const handleResponse = async (response) => {
    if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Une erreur est survenue côté serveur.')
    }

    return response.json()
}

const channelKey = (gameId, channel) => `${gameId || 'unknown'}:${channel}`

const SOCKET_EVENT_MESSAGE_CREATED = 'message.created'

let socket = null
let subscribedGameId = null

const getSocketBaseUrl = () => {
    const fallbackOrigin =
        typeof window !== 'undefined' ? window.location.origin : undefined

    const configuredUrl =
        import.meta.env.VITE_URL_SOCKET || import.meta.env.VITE_URL_API

    if (!configuredUrl) {
        if (fallbackOrigin) {
            return fallbackOrigin
        }

        throw new Error('URL API non définie pour la connexion temps réel.')
    }

    try {
        const parsedUrl = new URL(configuredUrl, fallbackOrigin)
        return `${parsedUrl.protocol}//${parsedUrl.host}`
    } catch (error) {
        return configuredUrl.replace(/\/$/, '')
    }
}

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
    socketStatus: 'disconnected',
    socketError: null,
}

const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        clearMessagesError(state) {
            state.sendError = null
            state.aiError = null
            state.socketError = null
        },
        messageReceived(state, action) {
            const incomingMessage = action.payload
            const gameId = incomingMessage?.gameId || incomingMessage?.game?.id

            if (!gameId) return

            if (!state.messagesByGame[gameId]) state.messagesByGame[gameId] = []

            const existingIndex = state.messagesByGame[gameId].findIndex(
                (message) => message.id === incomingMessage.id,
            )

            if (existingIndex >= 0) {
                state.messagesByGame[gameId][existingIndex] = {
                    ...state.messagesByGame[gameId][existingIndex],
                    ...incomingMessage,
                }
            } else state.messagesByGame[gameId].push(incomingMessage)

            const statusKey = channelKey(
                gameId,
                incomingMessage.isCoaching ? 'coach' : 'player',
            )

            state.sendStatusByChannel[statusKey] = 'succeeded'
        },
        setSocketStatus(state, action) {
            state.socketStatus = action.payload
        },
        setSocketError(state, action) {
            state.socketError = action.payload
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
                const { gameId, isCoaching } = action.meta.arg
                state.sendStatusByChannel[
                    channelKey(gameId, isCoaching ? 'coach' : 'player')
                ] = 'loading'
                state.sendError = null
            })
            .addCase(sendMessageToGame.fulfilled, (state, action) => {
                const { gameId } = action.payload
                const { isCoaching } = action.meta.arg
                const statusKey = channelKey(
                    gameId,
                    isCoaching ? 'coach' : 'player',
                )

                state.sendStatusByChannel[statusKey] = 'succeeded'
            })
            .addCase(sendMessageToGame.rejected, (state, action) => {
                const { gameId, isCoaching } = action.meta.arg
                state.sendStatusByChannel[
                    channelKey(gameId, isCoaching ? 'coach' : 'player')
                ] = 'failed'
                state.sendError =
                    action.payload || "Impossible d'envoyer le message."
            })
    },
})

const { clearMessagesError, messageReceived, setSocketStatus, setSocketError } =
    messagesSlice.actions

const ensureSocketConnection = (dispatch) => {
    if (socket) return socket

    const socketUrl = getSocketBaseUrl()

    socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        path: '/socket.io',
    })

    const handleMessage = (payload) => {
        dispatch(messageReceived(payload))
    }

    socket.on('connect', () => {
        dispatch(setSocketStatus('connected'))
        dispatch(setSocketError(null))

        if (subscribedGameId) {
            socket.emit('joinGame', { gameId: subscribedGameId })
        }
    })

    socket.on('disconnect', () => {
        dispatch(setSocketStatus('disconnected'))
    })

    socket.on('connect_error', (error) => {
        dispatch(setSocketStatus('error'))
        dispatch(
            setSocketError(
                error?.message ||
                    'Impossible de se connecter au serveur en temps réel.',
            ),
        )
    })

    socket.on(SOCKET_EVENT_MESSAGE_CREATED, handleMessage)

    return socket
}

const leaveCurrentGameRoom = () => {
    if (socket && subscribedGameId) {
        socket.emit('leaveGame', { gameId: subscribedGameId })
        subscribedGameId = null
    }
}

export const subscribeToMessages = (gameId) => (dispatch) => {
    if (!gameId) {
        return
    }

    if (!socket || !socket.connected) {
        dispatch(setSocketStatus('connecting'))
    }
    dispatch(setSocketError(null))

    try {
        const nextGameId = String(gameId)
        const socketInstance = ensureSocketConnection(dispatch)

        if (subscribedGameId && subscribedGameId !== nextGameId) {
            if (socketInstance.connected) {
                socketInstance.emit('leaveGame', { gameId: subscribedGameId })
            }
        }

        subscribedGameId = nextGameId

        if (socketInstance.connected) {
            socketInstance.emit('joinGame', { gameId: nextGameId })
        }
    } catch (error) {
        dispatch(setSocketStatus('error'))
        dispatch(
            setSocketError(
                error instanceof Error
                    ? error.message
                    : 'Connexion temps réel impossible.',
            ),
        )
    }
}

export const disconnectMessagesSocket = () => (dispatch) => {
    if (!socket) {
        return
    }

    leaveCurrentGameRoom()

    socket.off(SOCKET_EVENT_MESSAGE_CREATED)
    socket.disconnect()
    socket = null

    dispatch(setSocketStatus('disconnected'))
    dispatch(setSocketError(null))
}

export { clearMessagesError }

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
    state.messages.sendStatusByChannel[
        channelKey(gameId, isCoaching ? 'coach' : 'player')
    ] || 'idle'

export const selectAiStatusForChannel = (state, gameId, isCoaching) =>
    state.messages.aiStatusByChannel[channelKey(gameId, isCoaching)] || 'idle'

export const selectMessagesError = (state, gameId) =>
    state.messages.fetchErrorByGame[gameId] || null

export const selectSendError = (state) => state.messages.sendError

export const selectAiError = (state) => state.messages.aiError

export const selectSocketStatus = (state) => state.messages.socketStatus

export const selectSocketError = (state) => state.messages.socketError
