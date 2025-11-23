import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography, Space, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setCurrentPage, setPageSize } from './store/slices/notesSlice';

const { Title, Text } = Typography;

interface Note {
    _id: string;
    original_text: string;
    translation: string;
    article_id: string;
    sentence_index: number;
    tags: string[];
    highlighted_words: string[];
    created_at: string;
}

const API_BASE_URL = 'http://localhost:8000';

export const MyNotesPage: React.FC = () => {
    const dispatch = useDispatch();
    const { currentPage, pageSize } = useSelector((state: RootState) => state.notes);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Note[]>([]);
    const [total, setTotal] = useState(0);

    const fetchNotes = async (page: number, size: number) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/tts/notes`, {
                params: { page, page_size: size }
            });
            setData(response.data.items);
            setTotal(response.data.total);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes(currentPage, pageSize);
    }, [currentPage, pageSize]);

    const handleTableChange = (pagination: any) => {
        if (pagination.current !== currentPage) {
            dispatch(setCurrentPage(pagination.current));
        }
        if (pagination.pageSize !== pageSize) {
            dispatch(setPageSize(pagination.pageSize));
        }
    };

    const columns: ColumnsType<Note> = [
        {
            title: '原文',
            dataIndex: 'original_text',
            key: 'original_text',
            render: (text: string, record: Note) => {
                // Simple highlighting for display
                // This is a basic implementation. For exact highlighting, we'd need to match indices or words.
                // Since we stored words, we can try to highlight them.
                if (!record.highlighted_words || record.highlighted_words.length === 0) {
                    return text;
                }

                // A simple approach: split by highlighted words and wrap in red
                // Note: This might be buggy if words overlap or repeat. 
                // For now, let's just display the text and list highlighted words separately for clarity.
                return <Text>{text}</Text>;
            }
        },
        {
            title: '翻译',
            dataIndex: 'translation',
            key: 'translation',
        },
        {
            title: '生词/重点',
            key: 'highlighted_words',
            render: (_, record) => (
                <Space wrap>
                    {record.highlighted_words.map((word, index) => (
                        <Tag color="red" key={index}>{word}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: '类型',
            dataIndex: 'tags',
            key: 'tags',
            render: (tags: string[]) => (
                <>
                    {tags.map(tag => {
                        let color = 'geekblue';
                        let label = tag;
                        if (tag === 'vocabulary') {
                            color = 'volcano';
                            label = '生词';
                        } else if (tag === 'grammar') {
                            color = 'green';
                            label = '语法';
                        }
                        return (
                            <Tag color={color} key={tag}>
                                {label}
                            </Tag>
                        );
                    })}
                </>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => new Date(date).toLocaleString(),
            width: 200,
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>我的笔记</Title>
            <Card>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        pageSizeOptions: ['10', '20', '50'],
                        showSizeChanger: true,
                        showQuickJumper: true,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};
