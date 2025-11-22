import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { setDifficultyLevel } from './store/slices/practiceSlice';
import './TranslationPracticePage.css';

const API_BASE_URL = 'http://localhost:8000';

const TranslationPracticePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const savedLevel = useSelector((state: RootState) => state.practice.difficultyLevel);

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(savedLevel);
    const [pendingCount, setPendingCount] = useState(0);

    // 初始化：检查题库并生成题目
    useEffect(() => {
        initializeQuestionBank();
    }, [selectedLevel]);

    // 初始化题库
    const initializeQuestionBank = async () => {
        try {
            // 检查题库数量
            const response = await fetch(
                `${API_BASE_URL}/api/questions/pending/count?level=${selectedLevel}`
            );
            const data = await response.json();
            setPendingCount(data.pending_count);

            // 获取第一道题
            await fetchNextQuestion();
        } catch (err) {
            console.error('初始化失败:', err);
        }
    };

    // 获取下一道题目
    const fetchNextQuestion = async () => {
        setLoading(true);
        setError('');
        setEvaluation(null);
        setUserAnswer('');

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/questions/next?level=${selectedLevel}`
            );

            if (!response.ok) throw new Error('获取题目失败');

            const data = await response.json();
            setCurrentQuestion(data.question);
            // 更新待完成数量（使用返回的数据，避免额外请求）
            if (data.pending_count !== undefined) {
                setPendingCount(data.pending_count);
            } else {
                await updatePendingCount();
            }

        } catch (err) {
            setError(err.message || '获取题目失败');
            console.error('获取题目失败:', err);
        } finally {
            setLoading(false);
        }
    };

    // 更新待完成数量
    const updatePendingCount = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/questions/pending/count?level=${selectedLevel}`
            );
            const data = await response.json();
            setPendingCount(data.pending_count);
        } catch (err) {
            console.error('更新数量失败:', err);
        }
    };

    // 提交答案
    const handleSubmit = async () => {
        if (!userAnswer.trim()) {
            setError('请输入答案');
            return;
        }

        if (!currentQuestion || !currentQuestion._id) {
            setError('题目信息异常');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/questions/${currentQuestion._id}/submit`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_answer: userAnswer
                    })
                }
            );

            if (!response.ok) throw new Error('提交失败');

            const data = await response.json();
            setEvaluation(data.evaluation);

            // 提交后更新待完成数量
            await updatePendingCount();

        } catch (err) {
            setError(err.message || '提交失败，请重试');
            console.error('提交失败:', err);
        } finally {
            setLoading(false);
        }
    };

    // 下一题
    const handleNext = async () => {
        await fetchNextQuestion();
    };

    // 切换难度
    const handleLevelChange = async (level) => {
        setSelectedLevel(level);
        dispatch(setDifficultyLevel(level)); // Save to Redux
        setCurrentQuestion(null);
        setEvaluation(null);
        setUserAnswer('');
        setError('');
    };

    // 获取分数颜色
    const getScoreColor = (score) => {
        if (score >= 8) return '#28a745';
        if (score >= 6) return '#ffc107';
        return '#dc3545';
    };

    return (
        <div className="practice-container">
            <div className="practice-main">
                {/* 头部 */}
                <div className="practice-card">
                    <div className="practice-header">
                        <h1 className="practice-title">🎯 日语练习</h1>
                        <div className="header-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => navigate("/practice/history")}
                            >
                                📊 查看记录
                            </button>
                        </div>
                    </div>

                    {/* 难度选择 */}
                    <div className="level-selector">
                        {['beginner', 'intermediate', 'advanced'].map((level) => (
                            <button
                                key={level}
                                className={`level-btn ${selectedLevel === level ? 'active' : ''}`}
                                onClick={() => handleLevelChange(level)}
                                disabled={loading}
                            >
                                {level === 'beginner' && '🌱 初级'}
                                {level === 'intermediate' && '🌿 中级'}
                                {level === 'advanced' && '🌳 高级'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 错误提示 */}
                {error && <div className="error-box">⚠️ {error}</div>}

                {/* 题目区域 */}
                {currentQuestion && (
                    <div className="practice-card">
                        <div className="question-section">
                            <div className="question-header">
                                <h3 className="section-title">📝 翻译下列句子</h3>
                            </div>

                            <div className="chinese-text">
                                {currentQuestion.question.chinese}
                            </div>

                            {currentQuestion.question.context && (
                                <div className="context-hint">
                                    💡 使用场景: {currentQuestion.question.context}
                                </div>
                            )}
                        </div>

                        {/* 答题区域 */}
                        {!evaluation && (
                            <div className="answer-section">
                                <textarea
                                    className="answer-input"
                                    placeholder="请输入你的日语翻译..."
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    disabled={loading}
                                    rows={4}
                                />
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={handleSubmit}
                                    disabled={loading || !userAnswer.trim()}
                                >
                                    {loading ? '评估中...' : '✅ 提交答案'}
                                </button>
                            </div>
                        )}

                        {/* 评估结果 */}
                        {evaluation && (
                            <div className="evaluation-section">
                                <div className="score-display">
                                    <div
                                        className="score-circle"
                                        style={{
                                            background: getScoreColor(evaluation.score),
                                            boxShadow: `0 4px 12px ${getScoreColor(evaluation.score)}40`
                                        }}
                                    >
                                        <div className="score-number">{evaluation.score}</div>
                                        <div className="score-text">分</div>
                                    </div>
                                    <div className="score-detail">
                                        <div className="overall-text">{evaluation.overall}</div>
                                        <div className="user-answer-display">
                                            你的答案: {userAnswer}
                                        </div>
                                    </div>
                                </div>

                                {/* 详细分析 */}
                                <div className="analysis-grid">
                                    {evaluation.grammar_analysis && (
                                        <div className="analysis-item">
                                            <div className="analysis-title">📝 语法分析</div>
                                            <div className="analysis-content">
                                                {evaluation.grammar_analysis}
                                            </div>
                                        </div>
                                    )}

                                    {evaluation.vocabulary_analysis && (
                                        <div className="analysis-item">
                                            <div className="analysis-title">📖 词汇分析</div>
                                            <div className="analysis-content">
                                                {evaluation.vocabulary_analysis}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 标准答案 */}
                                {evaluation.standard_answers?.length > 0 && (
                                    <div className="standard-answers">
                                        <div className="section-title">✅ 标准答案</div>
                                        {evaluation.standard_answers.map((answer, idx) => (
                                            <div key={idx} className="standard-answer-item">
                                                {answer}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* 改进建议 */}
                                {evaluation.suggestions?.length > 0 && (
                                    <div className="suggestions">
                                        <div className="section-title">💡 改进建议</div>
                                        <ul className="suggestion-list">
                                            {evaluation.suggestions.map((suggestion, idx) => (
                                                <li key={idx}>{suggestion}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* 鼓励语 */}
                                {evaluation.praise && (
                                    <div className="praise-box">
                                        💬 {evaluation.praise}
                                    </div>
                                )}

                                {/* 下一题按钮 */}
                                <button
                                    className="btn btn-primary btn-large"
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    ➡️ 下一题
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* 加载状态 */}
                {loading && !currentQuestion && (
                    <div className="practice-card">
                        <div className="loading-box">
                            <div className="spinner"></div>
                            <div>加载中...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TranslationPracticePage;
