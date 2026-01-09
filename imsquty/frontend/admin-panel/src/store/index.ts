import { configureStore } from '@reduxjs/toolkit'
import auditReducer from './slices/auditSlice'
import authReducer from './slices/authSlice'
import roleReducer from './slices/roleSlice'
import settingsReducer from './slices/settingsSlice'
import userReducer from './slices/userSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    roles: roleReducer,
    settings: settingsReducer,
    audit: auditReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
