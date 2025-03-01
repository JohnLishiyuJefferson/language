import { configureStore } from "@reduxjs/toolkit";
import editorReducer from "./editorSlice.ts";

export const store = configureStore({
    reducer: {
        editor: editorReducer, // 这里可以添加多个 reducer
    },
});

// 定义 RootState 和 AppDispatch 类型，方便 TypeScript 使用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
