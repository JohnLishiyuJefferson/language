import axios from "axios";

// const API_BASE_URL = "http://localhost:8000"; // 你的 Flask 服务器地址
const API_BASE_URL = "http://localhost:8001"; // 你的 Flask 服务器地址
// const API_BASE_URL = "http://54.206.63.167:5000";

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

export const processText2 = async (uploadedText: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/process2`,
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

export const fetchVideo = async () => {
    try {
        // 请求后端接口，返回 Blob 数据
        const response = await axios.get(`${API_BASE_URL}/get-video`, {
            responseType: 'blob'
        });
        return response.data;
        // 将 Blob 数据转换为 URL
        // const videoUrl = URL.createObjectURL(response.data);
        // console.log('Video URL:', videoUrl);
        // return videoUrl;
    } catch (error) {
        console.error('Error fetching video:', error);
        return null;
    }
};

// 调用 Flask 接口，传入文本参数并返回生成的音频 URL
export const fetchSynthesizedAudioByAwsPolly = async (text: string, useAI: boolean) => {
    try {
        console.log("请求aws");
        const response = await axios.get(`${API_BASE_URL}/synthesize-polly`, {
            params: { text, useAI },
            responseType: 'blob' // 以二进制 Blob 形式接收返回数据
        });
        // 将 Blob 数据转换为 URL
        return URL.createObjectURL(response.data);
    } catch (error) {
        console.error('Error fetching synthesized audio:', error);
        return null;
    }
}

export const fetchSynthesizedAudioJsonByAwsPolly = async (text: string) => {
    try {
        // const response = await axios.post(`${API_BASE_URL}/synthesize-polly-json`, { text });
        const response = await axios.post(`${API_BASE_URL}/merge`, { text });
        // 直接返回 JSON 数据，例如 speech marks 数组
        return response.data;
    } catch (error) {
        console.error('Error fetching synthesized audio JSON:', error);
        return null;
    }
};

export const registerUser = async (username, password) => {
    return axios.post(`${API_BASE_URL}/register`, { username, password });
};

export const loginUser = async (username, password) => {
    return axios.post(`${API_BASE_URL}/login`, { username, password });
};

export const addWord = async (wordId: number) => {
    const token = localStorage.getItem("token");//todo 这里不太对吧
    console.log("token", token);
    await axios.post(`${API_BASE_URL}/add_word`,
        { word_id: wordId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const synthesizeAudioByGoogleGTTS = async (options: { text: string; lang?: string;}): Promise<string> => {
    const { text, lang = 'en' } = options;
    try {
        console.log("请求的内容", text);
        const response = await fetch(`${API_BASE_URL}/synthesize-google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, lang }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const audioBlob = await response.blob();
        return URL.createObjectURL(audioBlob);
    } catch (error) {
        throw new Error(`Failed to generate audio: ${error.message}`);
    }
}


