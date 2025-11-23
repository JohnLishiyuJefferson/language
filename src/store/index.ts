import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import ragReducer from './slices/ragSlice';
import listeningReducer from './slices/listeningSlice';
import practiceReducer from './slices/practiceSlice';
import notesReducer from './slices/notesSlice';

const rootReducer = combineReducers({
    rag: ragReducer,
    listening: listeningReducer,
    practice: practiceReducer,
    notes: notesReducer,
});

const persistConfig = {
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
