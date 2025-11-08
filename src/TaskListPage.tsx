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

const { TextArea } = Input;
const { Title, Text } = Typography;

interface Task {
    task_id: string;
    text: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

interface TaskListPageProps {
    onViewTask: (taskId: string) => void;
}

export const TaskListPage: React.FC<TaskListPageProps> = ({ onViewTask }) => {
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

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
        if (!inputText.trim()) {
            message.warning('请输入日语文本');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/tts/create-task`, {
                text: inputText,
            });

            message.success('任务创建成功!正在处理中...');
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

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>
                <SoundOutlined /> 日语文本转语音学习工具
            </Title>

            <Card title="输入日语文本" style={{ marginBottom: '24px' }}>
                <TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入日语文本..."
                    rows={6}
                    disabled={loading}
                />
                <div style={{ marginTop: '16px', textAlign: 'right' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SoundOutlined />}
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? '处理中...' : '生成音频和翻译'}
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
                                    onClick={() => onViewTask(task.task_id)}
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
                                                        : 'processing'
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
