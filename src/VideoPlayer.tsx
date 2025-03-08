import React, { useRef, useState, useEffect } from 'react';
import { fetchVideo } from "./api";  // 假设 fetchVideo 返回一个 Blob 对象

const VideoPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);

    // 获取视频
    const processVideo = async () => {
        try {
            const data = await fetchVideo();
            const url = URL.createObjectURL(data);
            setVideoUrl(url);
        } catch (error) {
            console.error("Error fetching video:", error);
        }
    };

    useEffect(() => {
        processVideo();
    }, []);

    useEffect(() => {
        if (!videoUrl) return;
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('ended', handleEnded);
        };
    }, [videoUrl]);

    // 播放 / 暂停
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // 停止播放（停止后回到起点）
    const stopVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };

    // 设置播放倍速
    const changePlaybackRate = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
        }
    };

    // 快进 / 快退
    const skipTime = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
        }
    };

    // 进度条拖动
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const newTime = parseFloat(e.target.value);
            videoRef.current.currentTime = newTime;
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
        <div style={{ width: '640px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
            <h3>视频播放器</h3>
            {videoUrl && (
                <>
                    {/* video 元素，隐藏默认控制器 */}
                    <video ref={videoRef} src={videoUrl} width="100%" controls={false} style={{ backgroundColor: '#000' }} />

                    {/* 播放控制按钮 */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '10px 0' }}>
                        <button onClick={togglePlay}>{isPlaying ? '暂停' : '播放'}</button>
                        <button onClick={stopVideo}>🛑 停止</button>
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
        </div>
    );
};

export default VideoPlayer;
