import React, { useState, useEffect } from 'react';
import { Input, List, Card, Button, Typography, Space, message } from 'antd';
import axios from 'axios';
import { SearchOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setSearchState } from './store/slices/ragSlice';

const { Search } = Input;
const { Title, Text } = Typography;

interface SearchResult {
    question: string;
    answer: string;
    score: number;
}

const API_BASE_URL = 'http://localhost:8000';

const RagSearchPage: React.FC = () => {
    const dispatch = useDispatch();
    const { query: savedQuery, results: savedResults } = useSelector((state: RootState) => state.rag);

    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(savedQuery);
    const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());

    useEffect(() => {
        setSearchInput(savedQuery);
    }, [savedQuery]);

    const onSearch = async (value: string) => {
        if (!value.trim()) return;

        setLoading(true);
        setVisibleAnswers(new Set());

        try {
            const response = await axios.post(API_BASE_URL + '/rag/search', {
                query: value,
                k: 5
            });
            const results = response.data.results;

            // Save to Redux
            dispatch(setSearchState({ query: value, results }));

            if (results.length === 0) {
                message.info('未找到相关内容');
            }
        } catch (error) {
            console.error('Search failed:', error);
            message.error('搜索失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const toggleAnswer = (index: number) => {
        const newVisible = new Set(visibleAnswers);
        if (newVisible.has(index)) {
            newVisible.delete(index);
        } else {
            newVisible.add(index);
        }
        setVisibleAnswers(newVisible);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
                智能问答检索
            </Title>

            <Search
                placeholder="请输入关键词搜索相关问题..."
                allowClear
                enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
                size="large"
                onSearch={onSearch}
                loading={loading}
                style={{ marginBottom: '30px' }}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
            />

            <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={savedResults}
                renderItem={(item, index) => (
                    <List.Item>
                        <Card
                            title={<Text strong>{item.question}</Text>}
                            extra={
                                <Button
                                    type="text"
                                    icon={visibleAnswers.has(index) ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                                    onClick={() => toggleAnswer(index)}
                                >
                                    {visibleAnswers.has(index) ? '隐藏答案' : '查看答案'}
                                </Button>
                            }
                            hoverable
                        >
                            {visibleAnswers.has(index) ? (
                                <div style={{
                                    padding: '10px',
                                    backgroundColor: '#f6f6f6',
                                    borderRadius: '4px',
                                    borderLeft: '4px solid #1890ff'
                                }}>
                                    <Text>{item.answer}</Text>
                                </div>
                            ) : (
                                <Text type="secondary" italic>点击右上角按钮查看答案...</Text>
                            )}
                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    相似度: {(item.score * 100).toFixed(1)}%
                                </Text>
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default RagSearchPage;
