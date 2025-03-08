import { useEffect, useState } from "react";
import axios from "axios";

const VocabularyBook = () => {
    const [words, setWords] = useState([]);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://127.0.0.1:5000/get_words", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWords(res.data);
        } catch (err) {
            console.error("获取生词本失败", err);
        }
    };

    const handleDeleteWord = async (word_id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://127.0.0.1:5000/delete_word/${word_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWords(words.filter(word => word.word_id !== word_id));
        } catch (err) {
            console.error("删除单词失败", err);
        }
    };

    return (
        <div>
            <h2>我的生词本</h2>
            <ul>
                {words.map(word => (
                    <li key={word.word_id}>
                        {word.word_id} <button onClick={() => handleDeleteWord(word.word_id)}>删除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default VocabularyBook;
