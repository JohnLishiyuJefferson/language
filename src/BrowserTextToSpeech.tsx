import React, { useState } from 'react';

const BrowserTextToSpeech: React.FC = () => {
    const [text, setText] = useState("笑死了姐妹");

    const speakText = () => {
        if (!text.trim()) {
            alert("请输入要朗读的文本");
            return;
        }

        // 创建一个 SpeechSynthesisUtterance 实例
        const utterance = new SpeechSynthesisUtterance(text);

        // 可选：设置语音、语速、音调等属性
        // 例如：选择一个日语语音（需浏览器支持）
        // const voices = window.speechSynthesis.getVoices();
        // utterance.voice = voices.find(voice => voice.lang === "ja-JP") || voices[0];
        utterance.rate = 1;    // 语速（0.1 ~ 10）
        utterance.pitch = 1;   // 音调（0 ~ 2）
        utterance.volume = 100;  // 音量（0 ~ 1）
        console.log("开始朗读");
        // 开始朗读
        window.speechSynthesis.speak(utterance);
        console.log("结束朗读");
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>文本转语音</h2>
            <textarea
                rows={5}
                style={{ width: '80%', padding: '10px' }}
                placeholder="请输入要朗读的文本..."
                value={text}
                onChange={e => setText(e.target.value)}
            ></textarea>
            <br />
            <button onClick={speakText} style={{ marginTop: '20px', padding: '10px 20px' }}>
                朗读文本
            </button>
        </div>
    );
};

export default BrowserTextToSpeech;
