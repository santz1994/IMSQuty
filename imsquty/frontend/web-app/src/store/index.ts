import { configureStore } from '@reduxjs/toolkit'
import assetReducer from './slices/assetSlice'
import authReducer from './slices/authSlice'
import ticketReducer from './slices/ticketSlice'
import divisionReducer from './slices/divisionSlice'
import locationReducer from './slices/locationSlice'
import manufacturerReducer from './slices/manufacturerSlice'
import warrantyTypeReducer from './slices/warrantyTypeSlice'
import ticketPriorityReducer from './slices/ticketPrioritySlice'
import ticketStatusReducer from './slices/ticketStatusSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    asset: assetReducer,
    ticket: ticketReducer,
    division: divisionReducer,
    location: locationReducer,
    manufacturer: manufacturerReducer,
    warrantyType: warrantyTypeReducer,
    ticketPriority: ticketPriorityReducer,
    ticketStatus: ticketStatusReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
