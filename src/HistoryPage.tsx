import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HistoryPage.css';

const API_BASE_URL = 'http://localhost:8000';

const HistoryPage: React.FC = () => {
    const navigate = useNavigate();

    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const limit = 10;

    // 获取统计信息
    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/stats`);
            if (!response.ok) throw new Error('获取统计失败');
            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('获取统计失败:', err);
        }
    };

    // 获取记录列表
    const fetchRecords = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await fetch(
                `${API_BASE_URL}/api/records?limit=${limit}&skip=${page * limit}`
            );

            if (!response.ok) throw new Error('获取记录失败');

            const data = await response.json();
            setRecords(data.records);
            setTotal(data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchRecords();
    }, [page]);

    // 获取分数颜色
    const getScoreColor = (score: number) => {
        if (score >= 8) return '#28a745';
        if (score >= 6) return '#ffc107';
        return '#dc3545';
    };

    // 格式化时间
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // 切换展开/折叠
    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="history-container">
            <div className="history-main-container">
                {/* 头部 */}
                <div className="history-card">
                    <div className="history-header">
                        <h1 className="history-title">📊 学习记录</h1>

                        {/* ← 使用 React Router 导航 */}
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/practice')}
                        >
                            返回练习
                        </button>
                    </div>

                    {/* 统计信息 */}
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-value">{stats.total_records}</div>
                                <div className="stat-label">总练习次数</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.average_score}</div>
                                <div className="stat-label">平均分</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.max_score}</div>
                                <div className="stat-label">最高分</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value">{stats.min_score}</div>
                                <div className="stat-label">最低分</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 错误提示 */}
                {error && <div className="error-box">⚠️ {error}</div>}

                {/* 记录列表 */}
                <div className="history-card">
                    {loading ? (
                        <div className="loading-box">
                            <div className="spinner"></div>
                            <div>加载中...</div>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">📚</div>
                            <h3>还没有练习记录</h3>
                            <p>开始练习后，记录会显示在这里</p>
                        </div>
                    ) : (
                        <>
                            <div className="records-list">
                                {records.map((record: any) => {
                                    const isExpanded = expandedId === record._id;
                                    return (
                                        <div
                                            key={record._id}
                                            className={`record-card ${isExpanded ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(record._id)}
                                        >
                                            {/* 记录头部 */}
                                            <div className="record-header">
                                                <div className="record-time">
                                                    {formatTime(record.created_at)}
                                                </div>
                                                <div
                                                    className="score-badge"
                                                    style={{
                                                        background: getScoreColor(record.evaluation.score),
                                                    }}
                                                >
                                                    {record.evaluation.score} 分
                                                </div>
                                            </div>

                                            {/* 题目和答案 */}
                                            <div className="record-content">
                                                <div className="question-text">
                                                    📝 {record.question.chinese}
                                                </div>

                                                {record.question.word && (
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <span className="word-badge">
                                                            {record.question.word} ({record.question.kana}) - {record.question.meaning}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="answer-text">
                                                    <span className="text-label">你的答案:</span>
                                                    {record.user_answer}
                                                </div>

                                                <div className="answer-text">
                                                    <span className="text-label">评价:</span>
                                                    {record.evaluation.overall}
                                                </div>

                                                {/* 展开的详细信息 */}
                                                {isExpanded && (
                                                    <div className="detail-section">
                                                        {/* 语法分析 */}
                                                        {record.evaluation.grammar_analysis && (
                                                            <div>
                                                                <div className="detail-title">📝 语法分析</div>
                                                                <div className="detail-content">
                                                                    {record.evaluation.grammar_analysis}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 词汇分析 */}
                                                        {record.evaluation.vocabulary_analysis && (
                                                            <div>
                                                                <div className="detail-title">📖 词汇分析</div>
                                                                <div className="detail-content">
                                                                    {record.evaluation.vocabulary_analysis}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 标准答案 */}
                                                        {record.evaluation.standard_answers &&
                                                            record.evaluation.standard_answers.length > 0 && (
                                                                <div>
                                                                    <div className="detail-title">✅ 标准答案</div>
                                                                    {record.evaluation.standard_answers.map((answer: string, idx: number) => (
                                                                        <div key={idx} className="standard-answer">
                                                                            {answer}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                        {/* 改进建议 */}
                                                        {record.evaluation.suggestions &&
                                                            record.evaluation.suggestions.length > 0 && (
                                                                <div>
                                                                    <div className="detail-title">💡 改进建议</div>
                                                                    <ul className="suggestion-list">
                                                                        {record.evaluation.suggestions.map((suggestion: string, idx: number) => (
                                                                            <li key={idx} className="suggestion-item">
                                                                                • {suggestion}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                        {/* 鼓励语 */}
                                                        {record.evaluation.praise && (
                                                            <div className="detail-content praise-box">
                                                                💬 {record.evaluation.praise}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 分页 */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        disabled={page === 0}
                                    >
                                        上一页
                                    </button>
                                    <span className="pagination-text">
                                        {page + 1} / {totalPages}
                                    </span>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                        disabled={page >= totalPages - 1}
                                    >
                                        下一页
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
