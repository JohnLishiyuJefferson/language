import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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
    currentTime: number;
}

// 初始化状态
const initialState: EditorState = { uploadedText: newsText, vocabulary: null, selectedText: "", analyzedText: [], dict: undefined, currentTime: 0 };

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        updateUploadedText: (state, action: PayloadAction<string>) => {
            state.uploadedText = action.payload;
        },
        updateAnalyzedText: (state, action: PayloadAction<Array<TimedLine>>) => {
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
        updateCurrentTime: (state, action: PayloadAction<number>) => {
            state.currentTime = action.payload;
        },
    },
});

export const { updateUploadedText, updateVocabulary, updateSelectedText, updateAnalyzedText, updateDict, updateCurrentTime } = editorSlice.actions;
export default editorSlice.reducer;
