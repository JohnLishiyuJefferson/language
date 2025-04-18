import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {TimedLine, Vocabulary} from "./Entity.ts";
import {originalText} from "./originalText.ts";
import {newsText} from "./news.ts";

interface EditorState {
    uploadedText: string;
    // vocabulary: Vocabulary | null;
    vocabulary: Vocabulary | null;
    selectedText: string;
    analyzedText: Array<TimedLine>;
    dict: Record<string, Vocabulary> | undefined;
    currentTimeJa: number;
    currentTimeEn: number;
    alternateState: number;
}

// 初始化状态
const initialState: EditorState = {
    uploadedText: newsText,
    vocabulary: null,
    selectedText: "",
    analyzedText: [],
    dict: undefined,
    currentTimeJa: 0, currentTimeEn: 0,
    alternateState: -1,
};

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        updateUploadedText: (state, action: PayloadAction<string>) => {
            state.uploadedText = action.payload;
        },
        updateDisplayedText: (state, action: PayloadAction<Array<TimedLine>>) => {
            state.analyzedText = action.payload;
        },
        updateVocabulary: (state, action: PayloadAction<Vocabulary>) => {
            console.log("updateVocabulary", action.payload);
            state.vocabulary = action.payload;
        },
        updateSelectedText: (state, action: PayloadAction<string>) => {
            state.selectedText = action.payload;
        },
        updateDict: (state, action: PayloadAction<Record<string, Vocabulary> | undefined>) => {
            state.dict = action.payload;
        },
        updateCurrentTimeJa: (state, action: PayloadAction<number>) => {
            state.currentTimeJa = action.payload;
        },
        updateCurrentTimeEn: (state, action: PayloadAction<number>) => {
            state.currentTimeEn = action.payload;
        },
        updateAlternateState: (state, action: PayloadAction<number>) => {
            state.alternateState = action.payload;
        },
    },
});

export const {
    updateUploadedText,
    updateVocabulary,
    updateSelectedText,
    updateDisplayedText,
    updateDict,
    updateCurrentTimeJa,
    updateCurrentTimeEn,
    updateAlternateState
} = editorSlice.actions;
export default editorSlice.reducer;
