import React, {useState, useMemo, useRef, useCallback} from 'react';
import {Button} from 'antd';
import {Structure, Vocabulary} from "./Entity.ts";
import {useDispatch, useSelector} from "react-redux";
import { updateVocabulary, updateSelectedText, updateCurrentTime } from "./editorSlice";
import {RootState} from "./store.ts";
import AudioPlayer, {AudioPlayerHandles} from "./AudioPlayer.tsx";
import {newsText} from "./news.ts";
import styles from './AnalyzedText.module.css';

interface PaginatedTextProps {
    wordsPerPage: number;  // 每页显示的单词数
}

const AnalyzedText: React.FC<PaginatedTextProps> = ({ wordsPerPage }) => {
    const timeLineList = useSelector((state: RootState) => state.editor.analyzedText);
    console.log("timeLineList", timeLineList, timeLineList.length);
    const dict = useSelector((state: RootState) => state.editor.dict);
    // 通过空格分割文本成单词数组
    // const words = timeLineList;
    // const timeStampList = timeLineList.map((timeLine) => {
    //     return timeLine.time;
    // } );
    // console.log("准备展示的词汇数组", words);
    const dispatch = useDispatch();
    const [currentPage, setCurrentPage] = useState(0);
    const [currentSentenceId, setCurrentSentenceId] = useState<number | null>(null);
    const [highlighted, setHighlighted] = useState<number | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const audioPlayerRef = useRef<AudioPlayerHandles | null>(null);
    // dispatch(updateSelectedText(newsText));//todo
    const handleMouseUp = () => {
        // const selection = window.getSelection()?.toString().trim() ?? "";
        // dispatch(updateSelectedText(selection));
    };

    // 使用 useCallback 缓存 updateCurrentSentenceId 函数
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
        setCurrentSentenceId(lastValidTimestamp);
        console.log("setCurrentSentenceId：", lastValidTimestamp);
    }, [timeLineList]);


    // 计算当前页的单词数组
    // const currentDisplayedWords = useMemo(() => {
    //     const start = currentPage * wordsPerPage;
    //     const end = start + wordsPerPage;
    //     // return words.slice(start, end);
    //     return words;
    // }, [currentPage, words, wordsPerPage]);

    // 计算总页数
    // const totalPages = Math.ceil(words.length / wordsPerPage);

    // 翻到下一页
    // const handleNextPage = () => {
    //     if (currentPage < totalPages - 1) {
    //         setCurrentPage(currentPage + 1);
    //     }
    // };

    // 返回上一页
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

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
    }


    return (
        <div>
             渲染当前页的文本
            <div onMouseUp={handleMouseUp} style={{height:'600px', overflowY: 'auto'}}>
                {timeLineList.map((timeLine) => (<div key={timeLine.time} style={{ display: 'inline' }} className={currentSentenceId === timeLine.time ? styles.activeLine : ''}>
                        <br/>
                    {timeLine.word_list.map((word, index) => (word === 'abccba' ? <br/> :
                        <span
                            key={index}
                            style={{
                                marginRight: 5,
                                backgroundColor: index === highlighted ? 'red' : 'transparent',
                                cursor: 'pointer',
                                fontSize: 20,
                                lineHeight: 1.8,
                                display: word === '\\t' ? 'block' : 'inline', // 如果是换行符，使用 block 显示
                            }}
                            onClick={() => {
                                setHighlighted(index);
                                setExplanation(processExplanation(word));
                                dispatch(updateVocabulary(dict[word]));
                            }
                            }
                            onContextMenu={(e) => {
                                e.preventDefault(); // 阻止默认的右键菜单
                                console.log(`右键点击了：${word}，时间：`, timeLine.time / 1000);
                                audioPlayerRef.current.handleStartSomewhere(timeLine.time / 1000);
                                // dispatch(updateCurrentTime(timeLine.time / 1000));
                                // 这里可以添加右键点击的逻辑，例如显示自定义菜单
                            }}
                        >
                        {/*<Tooltip title={(explanation && explanation.length > 50) ? `${explanation.substring(0, 50)}...` : explanation} placement="top" >*/}
                            {word}
                        {/*</Tooltip>*/}
                    </span>

                    ))}

                </div>

                ))}
            </div>
            {/* 分页按钮*/}
            {/*<div style={{ marginTop: 20 }}>*/}
            {/*    <Button onClick={handlePrevPage} disabled={currentPage === 0}>*/}
            {/*        上一页*/}
            {/*    </Button>*/}
            {/*    <span>{currentPage + 1} / {totalPages}</span>*/}
            {/*    <Button onClick={handleNextPage} disabled={currentPage === totalPages - 1}>*/}
            {/*        下一页*/}
            {/*    </Button>*/}
            {/*</div>*/}
            <AudioPlayer ref={audioPlayerRef} onTimeUpdate={updateCurrentSentenceId}/>

        </div>
    );
};

export default AnalyzedText;
