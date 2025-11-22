import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SearchResult {
    question: string;
    answer: string;
    score: number;
}

interface RagState {
    query: string;
    results: SearchResult[];
}

const initialState: RagState = {
    query: '',
    results: [],
};

const ragSlice = createSlice({
    name: 'rag',
    initialState,
    reducers: {
        setSearchState: (state, action: PayloadAction<{ query: string; results: SearchResult[] }>) => {
            state.query = action.payload.query;
            state.results = action.payload.results;
        },
        clearSearchState: (state) => {
            state.query = '';
            state.results = [];
        },
    },
});

export const { setSearchState, clearSearchState } = ragSlice.actions;
export default ragSlice.reducer;
