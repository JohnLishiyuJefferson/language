import React, { useState, useEffect } from 'react';
import './PracticePage.css';

const API_BASE_URL = 'http://localhost:8000';

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
        <div className="app-body">
            {/* 加载遮罩 */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-box">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">{loadingText}</div>
                    </div>
                </div>
            )}

            <div className="app-container">
                {/* 头部 */}
                <div className="app-card">
                    <div className="app-header">
                        <h1 className="app-title">🇯🇵 日语表达练习</h1>
                        <div className="header-controls">
                            <div className="level-selector">
                                {['beginner', 'intermediate', 'advanced'].map(level => (
                                    <button
                                        key={level}
                                        className={`level-btn ${currentLevel === level ? 'level-btn-active' : ''}`}
                                        onClick={() => changeLevel(level)}
                                        disabled={loading}
                                    >
                                        {level === 'beginner' ? '初级' : level === 'intermediate' ? '中级' : '高级'}
                                    </button>
                                ))}
                            </div>
                            {onNavigateToHistory && (
                                <button
                                    className="app-btn btn-secondary"
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
                    <div className="app-card">
                        <div className="question-card">
                            <div className="question-badge">📝 请将以下中文翻译成日语</div>
                            <div className="question-text">{currentQuestion.chinese}</div>
                            {currentQuestion.context && (
                                <div className="context-text">💡 {currentQuestion.context}</div>
                            )}
                        </div>

                        <div className="input-section">
                            <label className="input-label">✏️ 你的答案:</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="answer-input"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !loading && submitAnswer()}
                                    placeholder="请输入日语..."
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    className="app-btn btn-primary"
                                    onClick={submitAnswer}
                                    disabled={loading || !userAnswer.trim()}
                                >
                                    提交
                                </button>
                            </div>
                            <div className="input-hint">💡 提示: 按 Enter 键快速提交</div>
                        </div>

                        {error && <div className="error-box">⚠️ {error}</div>}
                    </div>
                )}

                {/* 评估结果卡片 */}
                {evaluation && (
                    <div className="app-card">
                        <div className="evaluation-card">
                            <div className="eval-header">
                                <div className="eval-emoji">{getEmoji(evaluation.score)}</div>
                                <div className="eval-header-content">
                                    <div className="eval-title">{evaluation.overall || '评估完成'}</div>
                                    <div>
                                        得分:{' '}
                                        <span className="eval-score" style={{ color: getScoreColor(evaluation.score) }}>
                                            {evaluation.score}
                                        </span>{' '}
                                        / 10
                                    </div>
                                </div>
                            </div>

                            {/* 你的答案 */}
                            <div className="eval-section">
                                <div className="eval-section-title">✍️ 你的答案</div>
                                <div className="eval-content">{evaluation.user_answer}</div>
                            </div>

                            {/* 语法分析 */}
                            {evaluation.grammar_analysis && (
                                <div className="eval-section">
                                    <div className="eval-section-title">📝 语法分析</div>
                                    <div className="eval-content">{evaluation.grammar_analysis}</div>
                                </div>
                            )}

                            {/* 词汇分析 */}
                            {evaluation.vocabulary_analysis && (
                                <div className="eval-section">
                                    <div className="eval-section-title">📖 词汇分析</div>
                                    <div className="eval-content">{evaluation.vocabulary_analysis}</div>
                                </div>
                            )}

                            {/* 标准答案 */}
                            {evaluation.standard_answers && evaluation.standard_answers.length > 0 && (
                                <div className="eval-section">
                                    <div className="eval-section-title">✅ 标准答案</div>
                                    {evaluation.standard_answers.map((answer, idx) => (
                                        <div key={idx} className="standard-answer">{answer}</div>
                                    ))}
                                </div>
                            )}

                            {/* 改进建议 */}
                            {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                                <div className="eval-section">
                                    <div className="eval-section-title">💡 改进建议</div>
                                    <ul className="suggestion-list">
                                        {evaluation.suggestions.map((suggestion, idx) => (
                                            <li key={idx} className="suggestion-item">
                                                💡 {suggestion}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 鼓励语 */}
                            {evaluation.praise && (
                                <div className="praise-box">{evaluation.praise}</div>
                            )}

                            <div className="button-group">
                                <button
                                    className="app-btn btn-secondary"
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
