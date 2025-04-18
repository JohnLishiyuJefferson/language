import React, {useState, useRef, useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from './store.ts';
import {
    updateVocabulary,
    updateCurrentTimeJa,
    updateDisplayedText,
    updateAlternateState,
    updateDict
} from './editorSlice';
import AudioPlayer, {AudioPlayerHandles} from './AudioPlayer.tsx';
import styles from './AnalyzedText.module.css';
import {Structure, TimedLine, Vocabulary, VocabularyFromBackend} from "./Entity.ts";
import {Button, Col, Popover, Row} from "antd";
import {doubleLanguage, doubleLanguageAI, merge2, processText} from "./api.ts";
import AudioPlayer2, {AudioPlayer2Handles} from "./AudioPlayer2.tsx";
import TextImportModal from "./TextImportModal.tsx";
import VocabularyList from "./VocabularyList.tsx";

interface PaginatedTextProps {
    wordsPerPage: number;  // 每页显示的单词数
}

const AnalyzedText: React.FC<PaginatedTextProps> = ({wordsPerPage}) => {
    const timeLineList = useSelector((state: RootState) => state.editor.analyzedText);
    // console.log("timeLineList", timeLineList);
    const uploadedText = useSelector((state: RootState) => state.editor.uploadedText);
    const dict = useSelector((state: RootState) => state.editor.dict);
    const dispatch = useDispatch();
    const [currentSentenceStartTime, setCurrentSentenceStartTime] = useState<number | null>(null);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [highlightedLine, setHighlightedLine] = useState<number | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);
    const jaAudioPlayerRef = useRef<AudioPlayerHandles | null>(null);
    const enAudioPlayerRef = useRef<AudioPlayer2Handles | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null); // 创建滚动窗口的引用
    // 为每个句子的 div 创建一个引用
    const sentenceRefs = useRef<Record<number, HTMLDivElement>>({});
    // const [playedSentenceIndex, setPlayedSentenceIndex] = useState<number>(0);
    const updateCurrentSentenceStartTime = useCallback((currentTime: number): number | null => {
        currentTime *= 1000;
        // console.log("analyzedText currentTime", currentTime, "timeLineList:", timeLineList);
        if (timeLineList.length === 0) return null;
        let lastValidTimestamp: number | null = null;
        for (const timeLine of timeLineList) {
            if (timeLine.time > currentTime) break; // 超过 currentTime 就停止
            lastValidTimestamp = timeLine.time;
        }
        if (currentSentenceStartTime == lastValidTimestamp) {
            return;
        }
        setCurrentSentenceStartTime(lastValidTimestamp);
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

        // console.log("setCurrentSentenceId：", lastValidTimestamp);
        return lastValidTimestamp;
    }, [timeLineList, currentSentenceStartTime]);

    const processExplanation = (word: string) => {
        if (!dict) {
            return "";
        }
        const dictElement = dict[word];
        // console.log(JSON.stringify(dictElement));
        const jointResult = dictElement?.structure_list?.map(structure => {
            return Structure.toStructureString(structure);
        }).join(" ");
        const content = dictElement?.kana + " " + jointResult;
        return content;
    };

    const doubleLanguage = async () => {
        const textList = timeLineList.map((timeLine) => {return timeLine.en_value});
        const jsonResp = await doubleLanguageAI(textList, "ja");
        const doubleLanguageLines = JSON.parse(jsonResp);
        const displayedLines = timeLineList.map((line, index) => ({
            ...line,
            word_list: [doubleLanguageLines[index].ja],
        }));
        dispatch(updateDisplayedText(displayedLines));
    }

    const onUpdateAudioJsonJa = (audioJson: Array<never>) => {
        const newTimeLineList = timeLineList.map((line, index) => {
            return {
                ...line,
                time: audioJson[index].time
            };
        });
        dispatch(updateDisplayedText(newTimeLineList));
    }

    const onUpdateAudioJsonEn = (audioJson: Array<never>) => {
        // const newTimeLineList = timeLineList.map((line, index) => {
        //     // console.log("audioJson", audioJson[index]);
        //     return {
        //         ...line,
        //         time2: audioJson[index].time,
        //     };
        // });
        const newTimeLineList = audioJson.map((line, index) => {
            // console.log("audioJson", audioJson[index]);
            return {
                time: undefined,
                word_list: [],
                time2: line.time,
                en_value: line.value,
            };
        });
        console.log("newTimeLineList: ", newTimeLineList);
        dispatch(updateDisplayedText(newTimeLineList));
    }

    const alternatePlay = () => {
        console.log("Alternate play");
        dispatch(updateAlternateState(0));
    }

    const parseJa = async () => {
        try {
            const jaText = timeLineList.map((line) => {
                return line.word_list[0]
            });//是否应该设置一个标志已经解析的标志位
            const response = await processText(jaText);
            const vocabularyList: Array<VocabularyFromBackend> = response.data.word_list;
            const parsedLineList = response.data.parsed_line_list;
            const newTimeLineList = timeLineList.map((line, index) => ({
                ...line,
                word_list: parsedLineList[index]
            }));
            dispatch(updateDisplayedText(newTimeLineList));
            const vocabularies = vocabularyList.map(item => {
                const vocabulary: Vocabulary = new Vocabulary(item.word, item.base_form, item.explanation, item.kana, [], item.id);
                vocabulary.structure_list = JSON.parse(item.structure);
                return vocabulary;
            });
            const vocabularyMap = vocabularies?.reduce<Record<string, Vocabulary>>((acc, vocabulary) => {
                acc[vocabulary.word] = vocabulary;
                return acc;
            }, {});
            dispatch(updateDict(vocabularyMap));
            console.log("响应数据", response.data);
            console.log("得到字典", vocabularyMap);
        } catch (error) {
            console.error("请求失败:", error);
        }
    };


    return (
        <div style={{}}>
            <TextImportModal/>
            <Button onClick={() => {
                doubleLanguage()
            }} type={"primary"}>翻译</Button>
            <Button onClick={() => {
                alternatePlay()
            }} type={"primary"}>轮播</Button>
            <Button onClick={() => {
                parseJa()
            }} type={"primary"}>解析</Button>
            <div ref={scrollContainerRef} onMouseUp={() => {
            }} style={{height: '600px', overflowY: 'auto', overflowX: 'hidden', maxWidth: '100%'}}>
                {timeLineList.map((timeLine, lineNumber) => (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <div
                                    key={timeLine.time}
                                    ref={(el) => {
                                        sentenceRefs.current[timeLine.time] = el;
                                    }} // 保存引用
                                    style={{display: 'inline'}}
                                    className={currentSentenceStartTime === timeLine.time ? styles.activeLine : ''}
                                >
                                    {timeLine.word_list.map((word, index) => (
                                        word === 'abccba' ? (<br/>) : (
                                            <Popover
                                                key={index}
                                                content={<VocabularyList/>}
                                                trigger="click"
                                                placement="right" // 弹出位置在右侧，你也可以调整为 top/bottom/left
                                            >
                                                <span
                                                    key={index}
                                                    className={styles.text}
                                                    style={{
                                                        marginRight: 0,
                                                        backgroundColor: (index === highlightedIndex && lineNumber === highlightedLine) ? 'red' : 'transparent',
                                                        display: word === '\\t' ? 'block' : 'inline',
                                                    }}
                                                    onClick={() => {
                                                        setHighlightedIndex(index);
                                                        setHighlightedLine(lineNumber);
                                                        setExplanation(processExplanation(word));
                                                        dispatch(updateVocabulary(dict[word]));
                                                    }}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        // console.log(`右键点击了：${word}，时间：`, timeLine.time / 1000);
                                                        jaAudioPlayerRef.current.handleStartSomewhere(timeLine.time / 1000);
                                                    }}
                                                >
                                                    {word}
                                                </span>
                                            </Popover>
                                        )
                                    ))}
                                </div>
                            </Col>
                            <Col span={12}>
                                <span
                                    className={styles.text}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        // console.log(`右键点击了：${timeLine.en_value}，时间：`, timeLine.time2 / 1000);
                                        enAudioPlayerRef.current.handleStartSomewhere(timeLine.time2 / 1000);
                                    }}>
                                    {timeLine.en_value}
                                </span>
                            </Col>
                        </Row>
                    </div>
                ))}
            </div>
            <AudioPlayer
                ref={jaAudioPlayerRef}
                language={"ja"}
                onTimeUpdate={updateCurrentSentenceStartTime}
                text={timeLineList.map(timeLine => timeLine.word_list.join("")).join("")}
                updateAudioJson={onUpdateAudioJsonJa}
                alternatePlay={alternatePlay}
            />
            <AudioPlayer2
                ref={enAudioPlayerRef}
                language={"en"}
                onTimeUpdate={updateCurrentSentenceStartTime}
                text={timeLineList.map(timeLine => timeLine.en_value).join(" ")}
                updateAudioJson={onUpdateAudioJsonEn}
                alternatePlay={alternatePlay}
            />
        </div>
    );
};

export default AnalyzedText;
