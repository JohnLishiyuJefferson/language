import React, { useState } from "react";
import {loginUser, registerUser} from "./api.ts";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./AuthContext.tsx";

export const RegisterAndLogin: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const response = await registerUser(username, password);
            setMessage(response.data.msg);
        } catch (error) {
            setMessage(error.response?.data?.msg || "注册失败");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(username, password);
            login(response.data.token);
            console.log("response.data.token", response.data.token);
            setMessage("登录成功");
            navigate("/dashboard");
        } catch (error) {
            setMessage(error.response?.data?.msg || "登录失败");
            alert("用户名或密码错误");
        }
    };

    return (
        <div>
            <h2>注册与登录</h2>
            <input type="text" placeholder="用户名" onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="密码" onChange={e => setPassword(e.target.value)} required />
            <button onClick={handleRegister}>注册</button>
            <button onClick={handleLogin}>登录</button>
            <p>{message}</p>
        </div>
    );
}
