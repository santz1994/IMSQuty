import { configureStore } from '@reduxjs/toolkit';
import assetReducer from './slices/assetSlice';
import authReducer from './slices/authSlice';
import divisionReducer from './slices/divisionSlice';
import locationReducer from './slices/locationSlice';
import manufacturerReducer from './slices/manufacturerSlice';
import ticketPriorityReducer from './slices/ticketPrioritySlice';
import ticketReducer from './slices/ticketSlice';
import ticketStatusReducer from './slices/ticketStatusSlice';
import warrantyTypeReducer from './slices/warrantyTypeSlice';
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
});
