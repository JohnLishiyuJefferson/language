import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store.ts';
import { updateVocabulary, updateCurrentTime } from './editorSlice';
import AudioPlayer, { AudioPlayerHandles } from './AudioPlayer.tsx';
import styles from './AnalyzedText.module.css';
import {Structure} from "./Entity.ts";

interface PaginatedTextProps {
    wordsPerPage: number;  // 每页显示的单词数
}

const AnalyzedText: React.FC<PaginatedTextProps> = ({ wordsPerPage }) => {
    const timeLineList = useSelector((state: RootState) => state.editor.analyzedText);
    const dict = useSelector((state: RootState) => state.editor.dict);
    const dispatch = useDispatch();
    const [currentSentenceId, setCurrentSentenceId] = useState<number | null>(null);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const audioPlayerRef = useRef<AudioPlayerHandles | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null); // 创建滚动窗口的引用
    // 为每个句子的 div 创建一个引用
    const sentenceRefs = useRef<Record<number, HTMLDivElement>>({});

    const updateCurrentSentenceId = useCallback((currentTime: number): number | null => {
        currentTime *= 1000;
        console.log("analyzedText currentTime", currentTime, "timeLineList:", timeLineList);
        if (timeLineList.length === 0) return null;
        let lastValidTimestamp: number | null = null;
        for (const timeLine of timeLineList) {
            console.log("time", timeLine, "currentTime", currentTime);
            if (timeLine.time > currentTime) break; // 超过 currentTime 就停止
            lastValidTimestamp = timeLine.time;
        }
        if (currentSentenceId == lastValidTimestamp) {
            return;
        }
        setCurrentSentenceId(lastValidTimestamp);
        // 如果有新的高亮句子，滚动到该句子
        if (lastValidTimestamp !== null && sentenceRefs.current[lastValidTimestamp] && scrollContainerRef.current) {
            const targetElement = sentenceRefs.current[lastValidTimestamp];
            const containerRect = scrollContainerRef.current.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const offsetTop = targetRect.top - containerRect.top;

            // 使用 requestAnimationFrame 实现平滑滚动
            const startTime = performance.now();
            const startScrollTop = scrollContainerRef.current.scrollTop;
            const targetScrollTop = offsetTop - containerRect.height / 2 + targetRect.height / 2;
            const duration = 300; // 滚动动画持续时间（毫秒）

            function animate(currentTime: number) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentScrollTop = startScrollTop + (targetScrollTop - startScrollTop) * progress;

                scrollContainerRef.current.scrollTop = currentScrollTop;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        }

        console.log("setCurrentSentenceId：", lastValidTimestamp);
        return lastValidTimestamp;
    }, [timeLineList, currentSentenceId]);

    const processExplanation = (word: string) => {
        if (!dict) {
            return "";
        }
        const dictElement = dict[word];
        console.log(JSON.stringify(dictElement));
        const jointResult = dictElement?.structure_list?.map(structure => {
            return Structure.toStructureString(structure);
        }).join(" ");
        const content = dictElement?.kana + " " + jointResult;
        return content;
    };

    return (
        <div>
            渲染当前页的文本
            <div ref={scrollContainerRef} onMouseUp={() => {}} style={{ height: '600px', overflowY: 'auto' }}>
                {timeLineList.map((timeLine) => (
                    <div
                        key={timeLine.time}
                        ref={(el) => { sentenceRefs.current[timeLine.time] = el; }} // 保存引用
                        style={{ display: 'inline' }}
                        className={currentSentenceId === timeLine.time ? styles.activeLine : ''}
                    >
                        <br />
                        {timeLine.word_list.map((word, index) => (
                            word === 'abccba' ? (
                                <br />
                            ) : (
                                <span
                                    key={index}
                                    style={{
                                        marginRight: 5,
                                        backgroundColor: index === highlighted ? 'red' : 'transparent',
                                        cursor: 'pointer',
                                        fontSize: 20,
                                        lineHeight: 1.8,
                                        display: word === '\\t' ? 'block' : 'inline',
                                    }}
                                    onClick={() => {
                                        setHighlighted(index);
                                        setExplanation(processExplanation(word));
                                        dispatch(updateVocabulary(dict[word]));
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        console.log(`右键点击了：${word}，时间：`, timeLine.time / 1000);
                                        audioPlayerRef.current.handleStartSomewhere(timeLine.time / 1000);
                                    }}
                                >
                                    {word}
                                </span>
                            )
                        ))}
                    </div>
                ))}
            </div>
            <AudioPlayer ref={audioPlayerRef} onTimeUpdate={updateCurrentSentenceId} />
        </div>
    );
};

export default AnalyzedText;
