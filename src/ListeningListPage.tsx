import React, { useState, useEffect } from 'react';
import {
    Input,
    Button,
    Card,
    message,
    List,
    Typography,
    Space,
    Tag,
} from 'antd';
import {
    SoundOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ← 新增

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Task {
    task_id: string;
    text: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const ListeningListPage: React.FC = () => {
    const navigate = useNavigate(); // ← 新增

    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

    const MAX_CHAR_COUNT = 3000;

    const loadTasks = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tts/tasks`);
            setTasks(response.data);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            message.error('加载任务列表失败');
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleSubmit = async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText) {
            message.warning('请输入日语文本');
            return;
        }

        if (trimmedText.length > MAX_CHAR_COUNT) {
            message.warning(`文本长度不能超过 ${MAX_CHAR_COUNT} 个字符`);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tts/create-task`, {
                text: trimmedText,
            });

            message.success('任务创建成功! 正在处理中...');
            setInputText('');
            pollTaskStatus(response.data.task_id);
        } catch (error) {
            console.error('Failed to create task:', error);
            message.error('创建任务失败');
            setLoading(false);
        }
    };

    const pollTaskStatus = async (taskId: string) => {
        const maxAttempts = 60;
        let attempts = 0;

        const poll = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/tts/task/${taskId}`);
                const task = response.data;

                if (task.status === 'completed') {
                    message.success('任务完成!');
                    setLoading(false);
                    loadTasks();
                    return;
                } else if (task.status === 'failed') {
                    message.error('任务处理失败');
                    setLoading(false);
                    loadTasks();
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000);
                } else {
                    message.warning('任务处理时间过长,请稍后刷新查看');
                    setLoading(false);
                    loadTasks();
                }
            } catch (error) {
                console.error('Failed to poll task status:', error);
                setLoading(false);
            }
        };

        poll();
    };

    // -----------------------------------
    // 跳转到详情页（代替 onViewTask）
    // -----------------------------------
    const goToDetail = (taskId: string) => {
        navigate(`/tasks/${taskId}`); // ← 直接跳路由
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>
                <SoundOutlined /> 日语听力
            </Title>

            <Card style={{ marginBottom: '24px' }}>
                <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入日语文本..."
                    rows={6}
                    disabled={loading}
                    maxLength={MAX_CHAR_COUNT} // 限制输入框最大长度
                />
                {/* 显示字符数 */}
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <Text type="secondary">
                        {inputText.length} / {MAX_CHAR_COUNT} 字
                    </Text>
                </div>
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SoundOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? '处理中...' : '生成'}
                    </Button>
                </div>
            </Card>

            <Card
                title="历史任务"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={loadTasks}>
                        刷新
                    </Button>
                }
            >
                <List
                    dataSource={tasks}
                    renderItem={(task) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => task.status === 'completed' && goToDetail(task.task_id)}
                                    disabled={task.status !== 'completed'}
                                >
                                    查看详情
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Space>
                                        <Text ellipsis style={{ maxWidth: '400px' }}>
                                            {task.text}
                                        </Text>
                                        <Tag
                                            color={
                                                task.status === 'completed'
                                                    ? 'success'
                                                    : task.status === 'failed'
                                                        ? 'error'
                                                        : task.status === 'processing'
                                                            ? 'processing'
                                                            : 'default'
                                            }
                                        >
                                            {task.status === 'completed'
                                                ? '已完成'
                                                : task.status === 'failed'
                                                    ? '失败'
                                                    : task.status === 'processing'
                                                        ? '处理中'
                                                        : '等待中'}
                                        </Tag>
                                    </Space>
                                }
                                description={`创建时间: ${new Date(task.created_at).toLocaleString()}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );
};
