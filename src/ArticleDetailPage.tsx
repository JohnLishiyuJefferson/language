import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Typography, Spin, message, Space, Divider, List } from 'antd';
import { ArrowLeftOutlined, TranslationOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const API_BASE_URL = 'http://localhost:8000';

interface TrilingualItem {
    index: number;
    original: string;
    japanese: string;
    chinese: string;
}

interface Article {
    _id: string;
    title: string;
    source_file: string;
    content: string;
    created_at: string;
    analysis?: TrilingualItem[];
}

export const ArticleDetailPage: React.FC = () => {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (articleId) {
            fetchArticle(articleId);
        }
    }, [articleId]);

    const fetchArticle = async (id: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/articles/${id}`);
            setArticle(response.data.article);
        } catch (error) {
            console.error('Failed to fetch article:', error);
            messageApi.error('获取文章详情失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!article) return;
        
        setAnalyzing(true);
        messageApi.info('正在分析文章，这可能需要几分钟...');
        
        try {
            const response = await axios.post(`${API_BASE_URL}/api/articles/${article._id}/analyze`);
            setArticle(response.data.article);
            messageApi.success('分析完成！');
        } catch (error: any) {
            console.error('Analysis failed:', error);
            const errorMsg = error.response?.data?.detail || error.message || '未知错误';
            messageApi.error(`分析失败: ${errorMsg}`);
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!article) {
        return (
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <Title level={3}>文章未找到</Title>
                <Button onClick={() => navigate('/articles')}>返回列表</Button>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            {contextHolder}
            
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/articles')}
                style={{ marginBottom: '16px' }}
            >
                返回列表
            </Button>

            <Card>
                <Title level={2}>{article.title}</Title>
                <Text type="secondary">来源: {article.source_file}</Text>
                <Divider />

                {!article.analysis ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Paragraph>
                            这篇文章尚未进行三语分析。点击下方按钮开始分析，生成日语和中文翻译。
                        </Paragraph>
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<TranslationOutlined />} 
                            onClick={handleAnalyze}
                            loading={analyzing}
                        >
                            {analyzing ? '正在分析...' : '开始三语分析'}
                        </Button>
                        {analyzing && (
                            <div style={{ marginTop: '16px' }}>
                                <Text type="secondary">分析过程可能需要几分钟，请耐心等待...</Text>
                            </div>
                        )}
                        
                        <Divider>原文预览</Divider>
                        <div style={{ textAlign: 'left', maxHeight: '300px', overflow: 'auto', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                {article.content}
                            </Paragraph>
                        </div>
                    </div>
                ) : (
                    <List
                        itemLayout="vertical"
                        dataSource={article.analysis}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '16px 0' }}>
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    {/* 英语 (原文) */}
                                    <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f1f1f' }}>
                                        {item.original}
                                    </Text>
                                    
                                    {/* 日语 */}
                                    <Text style={{ fontSize: '16px', color: '#1677ff' }}>
                                        {item.japanese}
                                    </Text>
                                    
                                    {/* 中文 */}
                                    <Text style={{ fontSize: '16px', color: '#8c8c8c' }}>
                                        {item.chinese}
                                    </Text>
                                </Space>
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};
