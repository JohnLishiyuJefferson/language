import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "antd/dist/reset.css";  // Ant Design v5 需要使用 reset.css
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import {RegisterAndLogin} from "./RegisterAndLogin.tsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        {/*<AuthProvider>*/}
        {/*    <Router>*/}
                {/*<Routes>*/}
                    {/* 登录页 */}
                    {/*<Route path="/login" element={<RegisterAndLogin />} />*/}
                    {/* 受保护的路由 */}
                    {/*<Route*/}
                    {/*    path="/*"*/}
                    {/*    element={*/}
                    {/*        <ProtectedRoute>*/}
                                <Provider store={store}>
                                    <App />
                                </Provider>
                            {/*</ProtectedRoute>*/}
                        {/*}*/}
                    {/*/>*/}
                {/*</Routes>*/}
            {/*</Router>*/}
        {/*</AuthProvider>*/}
    </React.StrictMode>
);
