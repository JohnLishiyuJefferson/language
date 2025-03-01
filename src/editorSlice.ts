import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Vocabulary} from "./Entity.ts";
import {originalText} from "./originalText.ts";
import {newsText} from "./news.ts";

interface EditorState {
    uploadedText: string;
    vocabulary: Vocabulary | null;
    selectedText: string;
    analyzedText: Array<string>;
    dict: Record<string, Vocabulary> | undefined;
}

// 初始化状态
const initialState: EditorState = { uploadedText: newsText, vocabulary: null, selectedText: "", analyzedText: [], dict: undefined };

const editorSlice = createSlice({
    name: "editor",
    initialState,
    reducers: {
        updateUploadedText: (state, action: PayloadAction<string>) => {
            state.uploadedText = action.payload;
        },
        updateAnalyzedText: (state, action: PayloadAction<Array<string>>) => {
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
    },
});

export const { updateUploadedText, updateVocabulary, updateSelectedText, updateAnalyzedText, updateDict } = editorSlice.actions;
export default editorSlice.reducer;
