import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ListeningState {
    currentTaskId: string | null;
    currentSentenceIndex: number;
}

const initialState: ListeningState = {
    currentTaskId: null,
    currentSentenceIndex: 0,
};

const listeningSlice = createSlice({
    name: 'listening',
    initialState,
    reducers: {
        setCurrentTask: (state, action: PayloadAction<string>) => {
            state.currentTaskId = action.payload;
            state.currentSentenceIndex = 0;
        },
        updateSentenceIndex: (state, action: PayloadAction<number>) => {
            state.currentSentenceIndex = action.payload;
        },
        clearCurrentTask: (state) => {
            state.currentTaskId = null;
            state.currentSentenceIndex = 0;
        },
    },
});

export const { setCurrentTask, updateSentenceIndex, clearCurrentTask } = listeningSlice.actions;
export default listeningSlice.reducer;
