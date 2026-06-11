import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import drilldownReducer from './slices/drilldownSlice';
import dashboardReducer from './slices/dashboardSlice';
import templateReducer from './slices/templateSlice';

export const store = configureStore({
    reducer: {
        drilldown: drilldownReducer,
        dashboard: dashboardReducer,
        template: templateReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

