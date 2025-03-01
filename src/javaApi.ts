import axios from "axios";

const API_BASE_URL = "http://localhost:85";

export const searchWordInES = async (word: string) => {
    try {
        // URL 编码
        const encodedWord = encodeURIComponent(word);
        const url = `${API_BASE_URL}/es/search?word=${encodedWord}`;

        // 发起 GET 请求
        const response = await axios.get(url);

        // 打印返回的结果
        console.log('Search results:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error searching word:', error);
    }
}
