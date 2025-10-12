import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000';

// 样式对象
const styles = {
    body: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        padding: '20px',
    },
    container: {
        maxWidth: '900px',
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
        flexWrap: 'wrap',
        gap: '16px',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    levelSelector: {
        display: 'flex',
        gap: '8px',
    },
    levelBtn: {
        padding: '8px 16px',
        border: '2px solid #ddd',
        background: 'white',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s',
    },
    levelBtnActive: {
        background: '#667eea',
        color: 'white',
        borderColor: '#667eea',
    },
    questionCard: {
        textAlign: 'center',
        padding: '40px 20px',
    },
    questionBadge: {
        display: 'inline-block',
        background: '#e3e8ff',
        color: '#667eea',
        padding: '8px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '24px',
    },
    questionText: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '16px',
        lineHeight: '1.4',
    },
    contextText: {
        display: 'inline-block',
        background: '#fff3cd',
        color: '#856404',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        marginTop: '12px',
    },
    inputSection: {
        marginTop: '24px',
    },
    inputLabel: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '12px',
        display: 'block',
    },
    inputGroup: {
        display: 'flex',
        gap: '12px',
    },
    answerInput: {
        flex: 1,
        padding: '14px 18px',
        fontSize: '18px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    btn: {
        padding: '14px 28px',
        fontSize: '16px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    btnPrimary: {
        background: '#28a745',
        color: 'white',
    },
    btnSecondary: {
        background: '#667eea',
        color: 'white',
    },
    hint: {
        fontSize: '13px',
        color: '#666',
        marginTop: '8px',
    },
    evaluationCard: {
        padding: '32px',
    },
    evalHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '24px',
        paddingBottom: '20px',
        borderBottom: '2px solid #eee',
    },
    evalEmoji: {
        fontSize: '56px',
    },
    evalTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '8px',
    },
    evalScore: {
        fontSize: '48px',
        fontWeight: 'bold',
    },
    evalSection: {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '16px',
    },
    evalSectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    evalContent: {
        color: '#555',
        lineHeight: '1.6',
    },
    standardAnswer: {
        background: '#d4edda',
        border: '1px solid #c3e6cb',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        fontSize: '18px',
        fontWeight: '500',
    },
    suggestionList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    suggestionItem: {
        padding: '8px 0',
        paddingLeft: '24px',
        position: 'relative',
    },
    praiseBox: {
        background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    buttonGroup: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        marginTop: '24px',
    },
    loadingOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingBox: {
        background: 'white',
        padding: '40px 60px',
        borderRadius: '12px',
        textAlign: 'center',
    },
    spinner: {
        width: '48px',
        height: '48px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px',
    },
    loadingText: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#333',
    },
    errorBox: {
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        color: '#721c24',
        padding: '16px',
        borderRadius: '8px',
        marginTop: '16px',
        fontWeight: '500',
    },
};

// CSS动画
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinnerStyle);

const JapanesePracticeApp = ({ onNavigateToHistory }) => {
    const [currentLevel, setCurrentLevel] = useState('beginner');
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [error, setError] = useState('');

    // 加载题目
    const loadQuestion = async (level = currentLevel) => {
        try {
            setLoading(true);
            setLoadingText('AI正在生成新题目...');
            setError('');
            setEvaluation(null);
            setUserAnswer('');

            const response = await fetch(`${API_BASE_URL}/api/question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ level })
            });

            if (!response.ok) throw new Error('获取题目失败');

            const data = await response.json();
            setCurrentQuestion(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingText('');
        }
    };

    // 提交答案
    const submitAnswer = async () => {
        if (!userAnswer.trim()) {
            setError('请先输入答案');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            setLoading(true);
            setLoadingText('AI正在评估你的答案...');
            setError('');

            const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chinese_prompt: currentQuestion.chinese,
                    user_answer: userAnswer,
                    context: currentQuestion.context || '',
                    word: currentQuestion.word || '',
                    kana: currentQuestion.kana || '',
                    meaning: currentQuestion.meaning || ''
                })
            });

            if (!response.ok) throw new Error('评估失败');

            const data = await response.json();
            setEvaluation(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingText('');
        }
    };

    // 切换难度
    const changeLevel = (level) => {
        setCurrentLevel(level);
        loadQuestion(level);
    };

    // 初始加载
    useEffect(() => {
        loadQuestion();
    }, []);

    // 获取分数颜色
    const getScoreColor = (score) => {
        if (score >= 8) return '#28a745';
        if (score >= 6) return '#ffc107';
        return '#dc3545';
    };

    // 获取表情
    const getEmoji = (score) => {
        if (score >= 9) return '🎉';
        if (score >= 7) return '👍';
        if (score >= 5) return '💪';
        return '📚';
    };

    return (
        <div style={styles.body}>
            {/* 加载遮罩 */}
            {loading && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.loadingBox}>
                        <div style={styles.spinner}></div>
                        <div style={styles.loadingText}>{loadingText}</div>
                    </div>
                </div>
            )}

            <div style={styles.container}>
                {/* 头部 */}
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h1 style={styles.title}>🇯🇵 日语表达练习</h1>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={styles.levelSelector}>
                                {['beginner', 'intermediate', 'advanced'].map(level => (
                                    <button
                                        key={level}
                                        style={{
                                            ...styles.levelBtn,
                                            ...(currentLevel === level ? styles.levelBtnActive : {})
                                        }}
                                        onClick={() => changeLevel(level)}
                                        disabled={loading}
                                    >
                                        {level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}
                                    </button>
                                ))}
                            </div>
                            {onNavigateToHistory && (
                                <button
                                    style={{ ...styles.btn, ...styles.btnSecondary }}
                                    onClick={onNavigateToHistory}
                                >
                                    📊 学习记录
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 题目卡片 */}
                {!evaluation && currentQuestion && (
                    <div style={styles.card}>
                        <div style={styles.questionCard}>
                            <div style={styles.questionBadge}>📝 请将以下中文翻译成日语</div>
                            <div style={styles.questionText}>{currentQuestion.chinese}</div>
                            {currentQuestion.context && (
                                <div style={styles.contextText}>💡 {currentQuestion.context}</div>
                            )}
                        </div>

                        <div style={styles.inputSection}>
                            <label style={styles.inputLabel}>✏️ 你的答案:</label>
                            <div style={styles.inputGroup}>
                                <input
                                    type="text"
                                    style={styles.answerInput}
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !loading && submitAnswer()}
                                    placeholder="请输入日语..."
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    style={{ ...styles.btn, ...styles.btnPrimary }}
                                    onClick={submitAnswer}
                                    disabled={loading || !userAnswer.trim()}
                                >
                                    提交
                                </button>
                            </div>
                            <div style={styles.hint}>💡 提示: 按 Enter 键快速提交</div>
                        </div>

                        {error && <div style={styles.errorBox}>⚠️ {error}</div>}
                    </div>
                )}

                {/* 评估结果卡片 */}
                {evaluation && (
                    <div style={styles.card}>
                        <div style={styles.evaluationCard}>
                            <div style={styles.evalHeader}>
                                <div style={styles.evalEmoji}>{getEmoji(evaluation.score)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={styles.evalTitle}>{evaluation.overall || '评估完成'}</div>
                                    <div>
                                        得分:{' '}
                                        <span style={{ ...styles.evalScore, color: getScoreColor(evaluation.score) }}>
                      {evaluation.score}
                    </span>{' '}
                                        / 10
                                    </div>
                                </div>
                            </div>

                            {/* 你的答案 */}
                            <div style={styles.evalSection}>
                                <div style={styles.evalSectionTitle}>✍️ 你的答案</div>
                                <div style={styles.evalContent}>{evaluation.user_answer}</div>
                            </div>

                            {/* 语法分析 */}
                            {evaluation.grammar_analysis && (
                                <div style={styles.evalSection}>
                                    <div style={styles.evalSectionTitle}>📝 语法分析</div>
                                    <div style={styles.evalContent}>{evaluation.grammar_analysis}</div>
                                </div>
                            )}

                            {/* 词汇分析 */}
                            {evaluation.vocabulary_analysis && (
                                <div style={styles.evalSection}>
                                    <div style={styles.evalSectionTitle}>📖 词汇分析</div>
                                    <div style={styles.evalContent}>{evaluation.vocabulary_analysis}</div>
                                </div>
                            )}

                            {/* 标准答案 */}
                            {evaluation.standard_answers && evaluation.standard_answers.length > 0 && (
                                <div style={styles.evalSection}>
                                    <div style={styles.evalSectionTitle}>✅ 标准答案</div>
                                    {evaluation.standard_answers.map((answer, idx) => (
                                        <div key={idx} style={styles.standardAnswer}>{answer}</div>
                                    ))}
                                </div>
                            )}

                            {/* 改进建议 */}
                            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                                <div style={styles.evalSection}>
                                    <div style={styles.evalSectionTitle}>💡 改进建议</div>
                                    <ul style={styles.suggestionList}>
                                        {evaluation.suggestions.map((suggestion, idx) => (
                                            <li key={idx} style={styles.suggestionItem}>
                                                💡 {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 鼓励语 */}
                            {evaluation.praise && (
                                <div style={styles.praiseBox}>{evaluation.praise}</div>
                            )}

                            <div style={styles.buttonGroup}>
                                <button
                                    style={{ ...styles.btn, ...styles.btnSecondary }}
                                    onClick={() => loadQuestion()}
                                    disabled={loading}
                                >
                                    下一题
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JapanesePracticeApp;
