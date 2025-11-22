import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PracticeState {
    difficultyLevel: string;
}

const initialState: PracticeState = {
    difficultyLevel: 'beginner',
};

const practiceSlice = createSlice({
    name: 'practice',
    initialState,
    reducers: {
        setDifficultyLevel: (state, action: PayloadAction<string>) => {
            state.difficultyLevel = action.payload;
        },
    },
});

export const { setDifficultyLevel } = practiceSlice.actions;
export default practiceSlice.reducer;
