import { configureStore } from '@reduxjs/toolkit'
import gamesReducer from './gamesSlice'
import messagesReducer from './messagesSlice'

export const store = configureStore({
    reducer: {
        games: gamesReducer,
        messages: messagesReducer,
    },
})

export default store
