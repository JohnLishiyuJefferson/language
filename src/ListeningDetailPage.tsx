import React, { useState, useEffect, useRef } from 'react';
import {
    Button,
    Card,
    message,
    Typography,
    Space,
    Tag,
    Divider,
    Row,
    Col,
    Spin,
    Slider,
    Tooltip,
} from 'antd';
import {
    ArrowLeftOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    TranslationOutlined,
    StepBackwardOutlined,
    StepForwardOutlined,
    ReloadOutlined,
    RetweetOutlined,
    OrderedListOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    SoundOutlined,
    VerticalAlignTopOutlined,
    MinusCircleOutlined,
    PlusCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { updateSentenceIndex, clearCurrentTask } from './store/slices/listeningSlice';

const { Title, Text, Paragraph } = Typography;

interface TranslationItem {
    index: number;
    original: string;
    translation: string;
}

interface SpeechMark {
    time: number;
    type: string;
    start: number;
    end: number;
    value: string;
}

interface Task {
    task_id: string;
    text: string;
    status: string;
    created_at: string;
    audio_url?: string;
    translations?: TranslationItem[];
    speech_marks?: SpeechMark[];
}

const API_BASE_URL = 'http://localhost:8000';

export const ListeningDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId: string }>();
    const dispatch = useDispatch();
    const savedSentenceIndex = useSelector((state: RootState) => state.listening.currentSentenceIndex);

    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [playMode, setPlayMode] = useState<'sequential' | 'loop'>('sequential');
    const [targetSentenceIndex, setTargetSentenceIndex] = useState<number | null>(null);
    const [volume, setVolume] = useState(100);

    // ⭐ 新增：显示模式相关状态
    const [displayMode, setDisplayMode] = useState<'progressive' | 'all'>('progressive');
    const [maxVisibleIndex, setMaxVisibleIndex] = useState<number>(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const sentenceRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    useEffect(() => {
        if (taskId) {
            loadTaskDetail();
        }
    }, [taskId]);

    const loadTaskDetail = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tts/task/${taskId}`);
            setTask(response.data);
            setLoading(false);

            // Restore playback position from Redux if available
            if (savedSentenceIndex > 0 && audioRef.current && response.data.speech_marks) {
                const savedMark = response.data.speech_marks[savedSentenceIndex];
                if (savedMark) {
                    setTimeout(() => {
                        if (audioRef.current) {
                            audioRef.current.currentTime = savedMark.time / 1000;
                        }
                    }, 500); // Small delay to ensure audio is loaded
                }
            }
        } catch (error) {
            console.error('Failed to load task details:', error);
            message.error('加载任务详情失败');
            setLoading(false);
        }
    };

    // 获取当前播放的句子索引
    const getCurrentSentenceIndex = () => {
        if (!task?.speech_marks) return -1;

        for (let i = task.speech_marks.length - 1; i >= 0; i--) {
            if (task.speech_marks[i].time <= currentTime) {
                return i;
            }
        }
        return -1;
    };

    const currentSentenceIndex = getCurrentSentenceIndex();

    // ⭐ 新增：更新已显示的最大句子索引
    useEffect(() => {
        if (displayMode === 'progressive' && currentSentenceIndex >= 0) {
            setMaxVisibleIndex(prev => Math.max(prev, currentSentenceIndex));
            // Save to Redux
            dispatch(updateSentenceIndex(currentSentenceIndex));
        }
    }, [currentSentenceIndex, displayMode]);

    // 滚动到当前句子
    useEffect(() => {
        if (currentSentenceIndex >= 0 && sentenceRefs.current[currentSentenceIndex]) {
            sentenceRefs.current[currentSentenceIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentSentenceIndex]);

    // 播放控制
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const playPreviousSentence = () => {
        if (!task?.speech_marks || !audioRef.current) return;

        const prevIndex = Math.max(0, currentSentenceIndex - 1);
        const prevTime = task.speech_marks[prevIndex].time / 1000;

        setTargetSentenceIndex(prevIndex); // 标记用户手动跳到的句子
        audioRef.current.currentTime = prevTime;

        if (!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        }

        if (playMode === 'loop') {
            message.info(`循环播放句子 ${prevIndex + 1}`);
        }
    };

    const playNextSentence = () => {
        if (!task?.speech_marks || !audioRef.current) return;

        const nextIndex = Math.min(task.speech_marks.length - 1, currentSentenceIndex + 1);
        const nextTime = task.speech_marks[nextIndex].time / 1000;

        setTargetSentenceIndex(nextIndex); // 标记用户手动跳到的句子
        audioRef.current.currentTime = nextTime;

        if (!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        }

        if (playMode === 'loop') {
            message.info(`循环播放句子 ${nextIndex + 1}`);
        }
    };

    const replayCurrentSentence = () => {
        if (!task?.speech_marks || !audioRef.current || currentSentenceIndex < 0) return;

        const currentTime = task.speech_marks[currentSentenceIndex].time / 1000;
        setTargetSentenceIndex(currentSentenceIndex); // 标记手动回放
        audioRef.current.currentTime = currentTime;

        if (!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const increasePlaybackRate = () => {
        if (!audioRef.current) return;
        const newRate = Math.min(2.0, playbackRate + 0.1);
        setPlaybackRate(Number(newRate.toFixed(1)));
        audioRef.current.playbackRate = Number(newRate.toFixed(1));
        message.info(`播放速度: ${newRate.toFixed(1)}x`);
    };

    const decreasePlaybackRate = () => {
        if (!audioRef.current) return;
        const newRate = Math.max(0.5, playbackRate - 0.1);
        setPlaybackRate(Number(newRate.toFixed(1)));
        audioRef.current.playbackRate = Number(newRate.toFixed(1));
        message.info(`播放速度: ${newRate.toFixed(1)}x`);
    };

    const togglePlayMode = () => {
        const newMode = playMode === 'sequential' ? 'loop' : 'sequential';
        setPlayMode(newMode);
        const modeText = newMode === 'sequential' ? '顺序播放' : '单句循环';
        message.info(`切换到${modeText}模式`);
    };

    // ⭐ 新增：切换显示模式
    const toggleDisplayMode = () => {
        const newMode = displayMode === 'progressive' ? 'all' : 'progressive';
        setDisplayMode(newMode);
        const modeText = newMode === 'progressive' ? '逐句显示' : '显示全部';
        message.info(`切换到${modeText}模式`);
    };

    // ⭐ 新增：判断句子是否应该显示
    const shouldShowSentence = (index: number) => {
        if (displayMode === 'all') return true;
        return index <= maxVisibleIndex;
    };

    const handleVolumeChange = (value: number) => {
        setVolume(value);
        if (audioRef.current) {
            audioRef.current.volume = value / 100;
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key) {
                case 'Shift':
                    e.preventDefault();
                    togglePlayMode();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    playPreviousSentence();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    playNextSentence();
                    break;
                case 'Enter':
                    e.preventDefault();
                    replayCurrentSentence();
                    break;
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    increasePlaybackRate();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    decreasePlaybackRate();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, currentSentenceIndex, playbackRate, playMode, task]);

    // 音频时间更新
    const handleTimeUpdate = () => {
        if (!audioRef.current) return;

        const newTime = audioRef.current.currentTime * 1000;
        const oldSentenceIndex = currentSentenceIndex;
        setCurrentTime(newTime);

        if (playMode === 'loop' && task?.speech_marks && oldSentenceIndex >= 0) {
            // 如果用户手动跳句，忽略本次循环逻辑
            if (targetSentenceIndex !== null && targetSentenceIndex !== oldSentenceIndex) {
                setTargetSentenceIndex(null); // 清空标记
                return;
            }

            const currentSentence = task.speech_marks[oldSentenceIndex];
            const nextSentence = task.speech_marks[oldSentenceIndex + 1];

            if (nextSentence && newTime >= nextSentence.time) {
                audioRef.current.currentTime = currentSentence.time / 1000;
            } else if (!nextSentence && audioRef.current.ended) {
                audioRef.current.currentTime = currentSentence.time / 1000;
                audioRef.current.play();
            }
        }
    };

    const handleBackToList = () => {
        dispatch(clearCurrentTask()); // Clear saved task
        navigate("/listening");
    };

    if (loading) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!task) {
        return (
            <div style={{ padding: '24px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/listening")}>
                    返回列表
                </Button>
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <Text type="secondary">任务不存在</Text>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', paddingBottom: '100px', maxWidth: '1200px', margin: '0 auto' }}>
            <Space style={{ marginBottom: '24px' }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBackToList}
                >
                    返回列表
                </Button>
            </Space>

            <Title level={2}>任务详情</Title>

            {task.audio_url && (
                <Card size="small" style={{ marginBottom: '16px' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            快捷键: 空格=暂停/播放 | ←=上一句 | →=下一句 | Enter=重播当前句 |
                            ↑=加速 | ↓=减速 | Shift=切换播放模式
                        </Text>
                        <audio
                            ref={audioRef}
                            src={`${API_BASE_URL}${task.audio_url}`}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                        />
                    </Space>
                </Card>
            )}

            <Divider orientation="left">
                <TranslationOutlined /> 原文与翻译对照
            </Divider>

            {/* ⭐ 修改：根据显示模式控制句子显示 */}
            {task.translations && task.translations.length > 0 ? (
                <div>
                    {task.translations.map((item, index) => {
                        const isVisible = shouldShowSentence(index);
                        const isCurrent = currentSentenceIndex === index;

                        return (
                            <Card
                                key={item.index}
                                ref={(el) => { sentenceRefs.current[index] = el }}
                                size="small"
                                style={{
                                    marginBottom: '12px',
                                    backgroundColor: isCurrent ? '#e6f7ff' : 'white',
                                    border: isCurrent
                                        ? '2px solid #1890ff'
                                        : '1px solid #d9d9d9',
                                    transition: 'all 0.3s',
                                    opacity: isVisible ? 1 : 0.3,
                                }}
                            >
                                <Row gutter={[16, 8]}>
                                    <Col span={24}>
                                        <Tag color="blue">句子 {item.index}</Tag>
                                        {!isVisible && (
                                            <Tag color="default">未播放</Tag>
                                        )}
                                    </Col>
                                    <Col span={24}>
                                        <Text strong>原文: </Text>
                                        <Paragraph style={{ marginBottom: 0, fontSize: '16px' }}>
                                            {isVisible ? item.original : '●●●●●●●●'}
                                        </Paragraph>
                                    </Col>
                                    <Col span={24}>
                                        <Text strong>翻译: </Text>
                                        <Paragraph style={{ marginBottom: 0, fontSize: '16px' }}>
                                            {isVisible ? item.translation : '●●●●●●●●'}
                                        </Paragraph>
                                    </Col>
                                </Row>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Text type="secondary">暂无翻译数据</Text>
            )}

            {/* 底部悬浮操作栏 */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid #e8e8e8',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
                padding: '12px 24px',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Space
                    size="small"
                    wrap={false}
                    style={{
                        transform: "scale(0.95)",
                        transformOrigin: "center",
                        transition: "transform .2s",
                        whiteSpace: "nowrap",
                    }}
                >
                    {/* 播放控制组 */}
                    <Space>
                        <Tooltip title="上一句 (←)">
                            <Button icon={<StepBackwardOutlined />} onClick={playPreviousSentence} />
                        </Tooltip>
                        <Tooltip title={isPlaying ? "暂停 (Space)" : "播放 (Space)"}>
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                onClick={togglePlay}
                            />
                        </Tooltip>
                        <Tooltip title="下一句 (→)">
                            <Button icon={<StepForwardOutlined />} onClick={playNextSentence} />
                        </Tooltip>
                        <Tooltip title="重播当前句 (Enter)">
                            <Button icon={<ReloadOutlined />} onClick={replayCurrentSentence} />
                        </Tooltip>
                    </Space>

                    <Divider type="vertical" style={{ height: '24px' }} />

                    {/* 速度控制组 */}
                    <Space>
                        <Tooltip title="减速 (↓)">
                            <Button icon={<MinusCircleOutlined />} onClick={decreasePlaybackRate} size="small" />
                        </Tooltip>
                        <div style={{ width: '60px', textAlign: 'center', fontWeight: 'bold' }}>
                            {playbackRate.toFixed(1)}x
                        </div>
                        <Tooltip title="加速 (↑)">
                            <Button icon={<PlusCircleOutlined />} onClick={increasePlaybackRate} size="small" />
                        </Tooltip>
                    </Space>

                    <Divider type="vertical" style={{ height: '24px' }} />

                    {/* 模式控制组 */}
                    <Space>
                        <Tooltip title={playMode === 'sequential' ? "切换到单句循环 (Shift)" : "切换到顺序播放 (Shift)"}>
                            <Button
                                icon={playMode === 'sequential' ? <OrderedListOutlined /> : <RetweetOutlined />}
                                onClick={togglePlayMode}
                                type={playMode === 'loop' ? 'primary' : 'default'}
                                ghost={playMode === 'loop'}
                            >
                                {playMode === 'sequential' ? '顺序播放' : '单句循环'}
                            </Button>
                        </Tooltip>
                        <Tooltip title={displayMode === 'progressive' ? "显示全部" : "逐句显示"}>
                            <Button
                                icon={displayMode === 'progressive' ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                onClick={toggleDisplayMode}
                            >
                                {displayMode === 'progressive' ? '逐句显示' : '显示全部'}
                            </Button>
                        </Tooltip>
                    </Space>

                    <Divider type="vertical" style={{ height: '24px' }} />

                    {/* 音量控制组 */}
                    <Space style={{ width: '150px' }}>
                        <SoundOutlined />
                        <Slider
                            min={0}
                            max={100}
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{ width: '100px' }}
                        />
                    </Space>

                    <Divider type="vertical" style={{ height: '24px' }} />

                    {/* 辅助功能 */}
                    <Tooltip title="回到顶部">
                        <Button icon={<VerticalAlignTopOutlined />} onClick={scrollToTop} />
                    </Tooltip>
                </Space>
            </div>
        </div>
    );
};
