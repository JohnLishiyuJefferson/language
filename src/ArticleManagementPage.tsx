import React, { useEffect, useState } from 'react';
import { Upload, Table, Button, message, Card, Typography, Modal, List, Space, Popconfirm } from 'antd';
import { DeleteOutlined, InboxOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import axios from 'axios';

const { Title, Text } = Typography;
const { Dragger } = Upload;

interface Article {
    _id: string;
    title: string;
    source_file: string;
    created_at: string;
}

interface UploadResult {
    filename: string;
    saved: string[];
    skipped: string[];
    saved_count: number;
    skipped_count: number;
}

const API_BASE_URL = 'http://localhost:8000';

export const ArticleManagementPage: React.FC = () => {
    const [messageApi, contextHolder] = message.useMessage();
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [resultModalVisible, setResultModalVisible] = useState(false);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/articles/`);
            setArticles(response.data.articles);
        } catch (error) {
            console.error('Failed to fetch articles:', error);
            messageApi.error('获取文章列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (file: UploadFile) => {
        const formData = new FormData();
        formData.append('file', file as any);

        setUploading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/articles/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setUploadResult(response.data);
            setResultModalVisible(true);

            // 刷新列表
            fetchArticles();

            messageApi.success(`上传成功！保存了 ${response.data.saved_count} 篇文章`);
        } catch (error: any) {
            console.error('Upload failed:', error);
            const errorMsg = error.response?.data?.detail || error.message || '未知错误';
            messageApi.error(`上传失败: ${errorMsg}`);
        } finally {
            setUploading(false);
        }

        return false; // 阻止默认上传行为
    };

    const uploadProps: UploadProps = {
        name: 'file',
        accept: '.pdf',
        beforeUpload: handleUpload,
        showUploadList: false,
    };

    const handleDelete = async (article_id: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/articles/${article_id}`);
            messageApi.success('文章已删除');
            fetchArticles();
        } catch (error: any) {
            console.error('Delete failed:', error);
            const errorMsg = error.response?.data?.detail || error.message || '未知错误';
            messageApi.error(`删除失败: ${errorMsg}`);
        }
    };

    const columns: ColumnsType<Article> = [
        {
            title: '文章标题',
            dataIndex: 'title',
            key: 'title',
            width: '60%',
            render: (text, record) => (
                <a onClick={() => window.location.href = `/articles/${record._id}`}>{text}</a>
            ),
        },
        {
            title: '来源文件',
            dataIndex: 'source_file',
            key: 'source_file',
            width: '25%',
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleDateString(),
            width: '10%',
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="确认删除"
                    description="确定要删除这篇文章吗？此操作不可恢复。"
                    onConfirm={() => handleDelete(record._id)}
                    okText="确定"
                    cancelText="取消"
                >
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                    >
                        删除
                    </Button>
                </Popconfirm>
            ),
            width: '5%',
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {contextHolder}
            <Title level={2}>读物管理</Title>

            <Card title="上传PDF文件" style={{ marginBottom: '24px' }}>
                <Dragger {...uploadProps} disabled={uploading}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽PDF文件到此区域上传</p>
                    <p className="ant-upload-hint">
                        支持上传《经济学人》期刊PDF文件，系统将自动解析并提取文章
                    </p>
                </Dragger>
            </Card>

            <Card title={`文章列表 (共 ${articles.length} 篇)`}>
                <Table
                    columns={columns}
                    dataSource={articles}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 20,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        showTotal: (total) => `共 ${total} 篇文章`,
                    }}
                />
            </Card>

            {/* 上传结果对话框 */}
            <Modal
                title="上传结果"
                open={resultModalVisible}
                onOk={() => setResultModalVisible(false)}
                onCancel={() => setResultModalVisible(false)}
                width={600}
                footer={[
                    <Button key="ok" type="primary" onClick={() => setResultModalVisible(false)}>
                        确定
                    </Button>,
                ]}
            >
                {uploadResult && (
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text strong>文件名：</Text>
                            <Text>{uploadResult.filename}</Text>
                        </div>

                        <div>
                            <Text strong style={{ color: 'green' }}>
                                成功保存 ({uploadResult.saved_count} 篇)：
                            </Text>
                            {uploadResult.saved.length > 0 ? (
                                <List
                                    size="small"
                                    bordered
                                    dataSource={uploadResult.saved}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                    style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}
                                />
                            ) : (
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary">无</Text>
                                </div>
                            )}
                        </div>

                        <div>
                            <Text strong style={{ color: 'orange' }}>
                                跳过 ({uploadResult.skipped_count} 篇)：
                            </Text>
                            {uploadResult.skipped.length > 0 ? (
                                <List
                                    size="small"
                                    bordered
                                    dataSource={uploadResult.skipped}
                                    renderItem={(item) => <List.Item>{item}</List.Item>}
                                    style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}
                                />
                            ) : (
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary">无</Text>
                                </div>
                            )}
                        </div>
                    </Space>
                )}
            </Modal>
        </div>
    );
};
