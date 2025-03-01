import axios from "axios";

const API_BASE_URL = "http://localhost:8000"; // 你的 Flask 服务器地址

export const processText = async (uploadedText: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/process`,
            { text: uploadedText },
            { headers: { "Content-Type": "application/json" } }
        );
        return response; // 返回服务器响应的数据
    } catch (error) {
        console.error("Error processing text:", error);
        throw error; // 抛出错误，调用方可以处理
    }
};

export const getAiReply = async (sentence: string, questions: string[]) : Promise<string> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sentence: sentence,
                questions: questions
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data; // 这里返回的 data 是 Flask 服务器返回的 JSON 结果
    } catch (error) {
        console.error("Error fetching explanation:", error);
        return "";
    }
};
