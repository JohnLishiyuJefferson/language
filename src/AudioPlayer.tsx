import React, { useRef, useState, useEffect } from 'react';
import {fetchAudio, fetchSynthesizedAudio} from "./api.ts";
import {Button} from "antd";
import {useSelector} from "react-redux";
import {RootState} from "./store.ts";

const AudioPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const selectedText = useSelector((state: RootState) => state.editor.selectedText);

    // 获取音频
    const processAudio = async (useAI: boolean) => {
        let url;
        if (selectedText) {
            url = await fetchSynthesizedAudio(selectedText, useAI);
        } else {
            url = await fetchAudio();
        }
        setAudioUrl(url);
    };

    useEffect(() => {
        if (!audioUrl) return;
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]); // 监听 audioRef.current

    // 播放 / 暂停
    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // 停止播放（停止后回到起点）
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    // 设置播放倍速
    const changePlaybackRate = (rate: number) => {
        if (audioRef.current) {
            audioRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    // 快进 / 快退
    const skipTime = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    };

    // 进度条拖动
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const newTime = parseFloat(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    // 格式化时间（秒 -> mm:ss）
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ width: '400px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
            <h3>音频播放器</h3>

            {audioUrl && (
                <>
                    <audio ref={audioRef} src={audioUrl} />

                    {/* 播放控制按钮 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
                        <button onClick={togglePlay}>{isPlaying ? '暂停' : '播放'}</button>
                        <button onClick={stopAudio}>🛑 停止</button>
                        <button onClick={() => skipTime(-5)}>⏪ 快退5s</button>
                        <button onClick={() => skipTime(5)}>⏩ 快进5s</button>
                    </div>

                    {/* 进度条 */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{ width: '100%' }}
                    />

                    {/* 时间显示 */}
                    <div style={{ marginTop: '10px' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* 倍速调节 */}
                    <div style={{ marginTop: '10px' }}>
                        <label>倍速：</label>
                        {[0.5, 1, 1.5, 2].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => changePlaybackRate(rate)}
                                style={{
                                    fontWeight: playbackRate === rate ? 'bold' : 'normal',
                                    backgroundColor: playbackRate === rate ? '#ddd' : 'transparent',
                                    borderRadius: '5px',
                                    padding: '5px',
                                    margin: '0 3px',
                                }}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </>
            )}
            <Button onClick={() => processAudio(false)}>生成机械语音</Button>
            <Button onClick={() => processAudio(true)}>生成AI语音</Button>
        </div>
    );
};

export default AudioPlayer;
