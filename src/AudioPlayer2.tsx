import React, {useRef, useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {
    fetchSynthesizedAudioByAwsPolly2,
    fetchSynthesizedAudioJsonByAwsPollyEn
} from "./api.ts";
import {Button, Input, Switch} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "./store.ts";
import {updateCurrentTimeEn, updateAlternateState} from "./editorSlice.ts";
import JSZip from "jszip";

export interface AudioPlayer2Handles {
    handleStartSomewhere: (startPoint: number) => void;
    play: () => void;
}

interface AudioPlayerProps {
    onTimeUpdate: (id: number | null) => void;
    text: string;
    language: string;
    updateAudioJson: (audioJson: Array<never>) => void;
    alternatePlay: (ja: boolean) => void;
}

const AudioPlayer2 = forwardRef<AudioPlayer2Handles, AudioPlayerProps>((props, ref) => {
    const {onTimeUpdate, text, language, updateAudioJson, alternatePlay} = props;
    const dispatch = useDispatch();
    const playedSentenceIndex = useRef(0);
    const alternateState = useSelector((state: RootState) => state.editor.alternateState);
    const timeLineList = useSelector((state: RootState) => state.editor.analyzedText);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const currentTime = useSelector((state: RootState) => state.editor.currentTimeEn);
    const [audioFileTitle, setAudioFileTitle] = useState<string | null>("默认标题");
    const setCurrentTime = (time: number) => {
        dispatch(updateCurrentTimeEn(time));
    }
    const [autoDownloadOn, setAutoDownloadOn] = useState(false);
    // 处理开关状态变化
    const handleSwitchChange = (checked) => {
        setAutoDownloadOn(checked);
    };
    useEffect(() => {
        if (alternateState == 1) {
            audioRef.current.play();
        }
    }, [alternateState]);
    // 获取音频
    const processAudio = async () => {
        try {
            // const awsAudioUrl = await fetchSynthesizedAudioByAwsPolly(uploadedText, true);
            // const jaText = timeLineList.map(timeLine => timeLine.word_list.join("")).join("");
            const awsAudioUrl = await fetchSynthesizedAudioByAwsPolly2(text, language);
            setAudioUrl(awsAudioUrl);
            const audioJson = await fetchSynthesizedAudioJsonByAwsPollyEn(text, language);
            updateAudioJson(audioJson);
            // const jsonResp = await fetchSynthesizedAudioJsonByAwsPolly(uploadedText);
            // console.log("Resp", jsonResp);
            // dispatch(updateAnalyzedText(jsonResp.original_text_list));
            // if (autoDownloadOn) {
            //     const audioResponse = await fetch(awsAudioUrl);
            //     const audioBlob = await audioResponse.blob();
            //     const audioUrlObject = URL.createObjectURL(audioBlob);
            //
            //     // 下载 JSON 文件
            //     const jsonString = JSON.stringify(jsonResp, null, 2);
            //     const jsonBlob = new Blob([jsonString], {type: 'application/json'});
            //     const jsonUrlObject = URL.createObjectURL(jsonBlob);
            //
            //     // 创建一个 ZIP 文件
            //     const zip = new JSZip();
            //     zip.file(audioFileTitle + ".mp3", audioBlob, {binary: true});
            //     zip.file(audioFileTitle + ".json", jsonString);
            //
            //     // 生成 ZIP 文件并下载
            //     const zipContent = await zip.generateAsync({type: "blob"});
            //     const zipUrlObject = URL.createObjectURL(zipContent);
            //
            //     // 创建下载链接
            //     const a = document.createElement("a");
            //     a.href = zipUrlObject;
            //     a.download = audioFileTitle + ".zip";
            //     document.body.appendChild(a);
            //     a.click();
            //     document.body.removeChild(a);
            //
            //     // 清理
            //     URL.revokeObjectURL(audioUrlObject);
            //     URL.revokeObjectURL(jsonUrlObject);
            //     URL.revokeObjectURL(zipUrlObject);
            // }
        } catch (error) {
            console.error("Error processing audio:", error);
        }
    };

    useEffect(() => {
        if (!audioUrl) return;
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => {
            setCurrentTime(audio.currentTime);
            onTimeUpdate(audio.currentTime);
            if (false) {
                stopBeforeNextSentence(audio.currentTime);
            }
        };
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);
        // 清理定时器和事件监听器
        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl, onTimeUpdate]);

    // 播放 / 暂停
    const togglePlay = () => {
        console.log("togglePlay ", audioRef.current);
        if (!audioRef.current) return;
        console.log("togglePlay isPlaying", isPlaying);
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const play = () => {
        if (!audioRef.current) return;
        audioRef.current.play();
        setIsPlaying(true);
    };

    const stopBeforeNextSentence = (time: number) => {
        if (playedSentenceIndex.current >= (timeLineList.length - 1)) {
            playedSentenceIndex.current = 0;
            return;
        }
        const nextSentenceStartTime = timeLineList[playedSentenceIndex.current + 1].time2 / 1000;
        const timeLeft = nextSentenceStartTime - time;
        if (timeLeft < 0.28) {
            console.log("停下来了，因为timeLeft:", timeLeft);
            console.log("英语 nextSentenceStartTime", nextSentenceStartTime,
                "time:", time, "下一句:", timeLineList[playedSentenceIndex.current + 1].en_value);
            playedSentenceIndex.current += 1;
            audioRef.current.pause();
            setIsPlaying(false);
            dispatch(updateAlternateState(0));
            // alternatePlay(true);
        }
    }

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

    // 使用 useImperativeHandle 将内部方法暴露给父组件
    useImperativeHandle(ref, () => ({
        handleStartSomewhere,
        play,
    }));

    const handleStartSomewhere = (startPoint: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = startPoint;
            setCurrentTime(startPoint);
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

            {(
                <>
                    <audio ref={audioRef} src={audioUrl}/>

                    {/* 播放控制按钮 */}
                    <div style={{display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0'}}>
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
                        style={{width: '100%'}}
                    />

                    {/* 时间显示 */}
                    <div style={{marginTop: '10px'}}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>

                    {/* 倍速调节 */}
                    <div style={{marginTop: '10px'}}>
                        <label>倍速：</label>
                        {[0.1, 0.5, 1, 1.5, 2].map((rate) => (
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
            <Input
                value={audioFileTitle}
                onChange={(e) => setAudioFileTitle(e.target.value)}
                placeholder="语音文件标题"
            />
            <Button onClick={processAudio}>生成语音</Button>
            <Switch
                checked={autoDownloadOn}
                onChange={handleSwitchChange}
            />
            <p>是否下载音频文件到本地: {autoDownloadOn ? '是' : '否'}</p>
        </div>
    );
});

export default AudioPlayer2;
