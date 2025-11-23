import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotesState {
    currentPage: number;
    pageSize: number;
}

const initialState: NotesState = {
    currentPage: 1,
    pageSize: 10,
};

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
        },
    },
});

export const { setCurrentPage, setPageSize } = notesSlice.actions;
export default notesSlice.reducer;
