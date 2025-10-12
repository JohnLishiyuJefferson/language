import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// 样式对象
const styles = {
    container: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px',
    },
    mainContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
    },
    card: {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '8px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#666',
    },
    recordsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    recordCard: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        transition: 'all 0.3s',
        cursor: 'pointer',
    },
    recordCardHover: {
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
    },
    recordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    recordTime: {
        fontSize: '13px',
        color: '#666',
    },
    scoreBadge: {
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: 'white',
    },
    recordContent: {
        marginTop: '12px',
    },
    questionText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    answerText: {
        fontSize: '16px',
        color: '#555',
        marginBottom: '4px',
    },
    label: {
        fontWeight: '600',
        color: '#667eea',
        marginRight: '8px',
    },
    detailSection: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e0e0e0',
    },
    detailTitle: {
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px',
    },
    detailContent: {
        fontSize: '14px',
        color: '#555',
        lineHeight: '1.6',
        marginBottom: '12px',
    },
    standardAnswer: {
        background: '#d4edda',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '6px',
        fontSize: '15px',
        fontWeight: '500',
    },
    suggestionList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    suggestionItem: {
        fontSize: '14px',
        color: '#555',
        marginBottom: '6px',
        paddingLeft: '20px',
        position: 'relative',
    },
    btn: {
        padding: '12px 24px',
        fontSize: '15px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    btnPrimary: {
        background: '#667eea',
        color: 'white',
    },
    btnSecondary: {
        background: '#f8f9fa',
        color: '#333',
        border: '1px solid #ddd',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        marginTop: '24px',
    },
    loadingBox: {
        textAlign: 'center',
        padding: '40px',
        color: '#666',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    errorBox: {
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        color: '#721c24',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '16px',
    },
    wordBadge: {
        display: 'inline-block',
        background: '#fff3cd',
        color: '#856404',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        marginRight: '8px',
    },
};

// 添加动画
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-spinner]')) {
    spinnerStyle.setAttribute('data-spinner', 'true');
    document.head.appendChild(spinnerStyle);
}

const HistoryPage = ({ onNavigateToPractice }) => {
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [expandedId, setExpandedId] = useState(null);
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
            const response = await fetch(`${API_BASE_URL}/api/records?limit=${limit}&skip=${page * limit}`);

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
    const getScoreColor = (score) => {
        if (score >= 8) return '#28a745';
        if (score >= 6) return '#ffc107';
        return '#dc3545';
    };

    // 格式化时间
    const formatTime = (timestamp) => {
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
    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div style={styles.container}>
            <div style={styles.mainContainer}>
                {/* 头部 */}
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>📊 学习记录</h1>
                        {onNavigateToPractice && (
                            <button
                                style={{ ...styles.btn, ...styles.btnPrimary }}
                                onClick={onNavigateToPractice}
                            >
                                返回练习
                            </button>
                        )}
                    </div>

                    {/* 统计信息 */}
                    {stats && (
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{stats.total_records}</div>
                                <div style={styles.statLabel}>总练习次数</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{stats.average_score}</div>
                                <div style={styles.statLabel}>平均分</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{stats.max_score}</div>
                                <div style={styles.statLabel}>最高分</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statValue}>{stats.min_score}</div>
                                <div style={styles.statLabel}>最低分</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 错误提示 */}
                {error && <div style={styles.errorBox}>⚠️ {error}</div>}

                {/* 记录列表 */}
                <div style={styles.card}>
                    {loading ? (
                        <div style={styles.loadingBox}>
                            <div style={styles.spinner}></div>
                            <div>加载中...</div>
                        </div>
                    ) : records.length === 0 ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>📚</div>
                            <h3>还没有练习记录</h3>
                            <p>开始练习后，记录会显示在这里</p>
                        </div>
                    ) : (
                        <>
                            <div style={styles.recordsList}>
                                {records.map((record) => {
                                    const isExpanded = expandedId === record._id;
                                    return (
                                        <div
                                            key={record._id}
                                            style={{
                                                ...styles.recordCard,
                                                ...(isExpanded ? styles.recordCardHover : {}),
                                            }}
                                            onClick={() => toggleExpand(record._id)}
                                        >
                                            {/* 记录头部 */}
                                            <div style={styles.recordHeader}>
                                                <div style={styles.recordTime}>
                                                    {formatTime(record.created_at)}
                                                </div>
                                                <div
                                                    style={{
                                                        ...styles.scoreBadge,
                                                        background: getScoreColor(record.evaluation.score),
                                                    }}
                                                >
                                                    {record.evaluation.score} 分
                                                </div>
                                            </div>

                                            {/* 题目和答案 */}
                                            <div style={styles.recordContent}>
                                                <div style={styles.questionText}>
                                                    📝 {record.question.chinese}
                                                </div>

                                                {record.question.word && (
                                                    <div style={{ marginBottom: '8px' }}>
                            <span style={styles.wordBadge}>
                              {record.question.word} ({record.question.kana}) - {record.question.meaning}
                            </span>
                                                    </div>
                                                )}

                                                <div style={styles.answerText}>
                                                    <span style={styles.label}>你的答案:</span>
                                                    {record.user_answer}
                                                </div>

                                                <div style={styles.answerText}>
                                                    <span style={styles.label}>评价:</span>
                                                    {record.evaluation.overall}
                                                </div>

                                                {/* 展开的详细信息 */}
                                                {isExpanded && (
                                                    <div style={styles.detailSection}>
                                                        {/* 语法分析 */}
                                                        {record.evaluation.grammar_analysis && (
                                                            <div>
                                                                <div style={styles.detailTitle}>📝 语法分析</div>
                                                                <div style={styles.detailContent}>
                                                                    {record.evaluation.grammar_analysis}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 词汇分析 */}
                                                        {record.evaluation.vocabulary_analysis && (
                                                            <div>
                                                                <div style={styles.detailTitle}>📖 词汇分析</div>
                                                                <div style={styles.detailContent}>
                                                                    {record.evaluation.vocabulary_analysis}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 标准答案 */}
                                                        {record.evaluation.standard_answers &&
                                                            record.evaluation.standard_answers.length > 0 && (
                                                                <div>
                                                                    <div style={styles.detailTitle}>✅ 标准答案</div>
                                                                    {record.evaluation.standard_answers.map((answer, idx) => (
                                                                        <div key={idx} style={styles.standardAnswer}>
                                                                            {answer}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                        {/* 改进建议 */}
                                                        {record.evaluation.suggestions &&
                                                            record.evaluation.suggestions.length > 0 && (
                                                                <div>
                                                                    <div style={styles.detailTitle}>💡 改进建议</div>
                                                                    <ul style={styles.suggestionList}>
                                                                        {record.evaluation.suggestions.map((suggestion, idx) => (
                                                                            <li key={idx} style={styles.suggestionItem}>
                                                                                • {suggestion}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                        {/* 鼓励语 */}
                                                        {record.evaluation.praise && (
                                                            <div style={{
                                                                ...styles.detailContent,
                                                                background: '#fff3cd',
                                                                padding: '12px',
                                                                borderRadius: '8px',
                                                                marginTop: '12px',
                                                            }}>
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
                                <div style={styles.pagination}>
                                    <button
                                        style={{ ...styles.btn, ...styles.btnSecondary }}
                                        onClick={() => setPage(Math.max(0, page - 1))}
                                        disabled={page === 0}
                                    >
                                        上一页
                                    </button>
                                    <span style={{ color: '#333', fontWeight: '600' }}>
                    {page + 1} / {totalPages}
                  </span>
                                    <button
                                        style={{ ...styles.btn, ...styles.btnSecondary }}
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
